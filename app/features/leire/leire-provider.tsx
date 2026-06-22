import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import {
  useSpeechRecognition,
  isSpeechRecognitionSupported,
  speak,
  cancelSpeech,
} from "./use-speech";
import {
  containsWakeWord,
  stripWakeWord,
  interpretQuery,
  type LeireContext as LeireData,
} from "./interpret";
import { fetchAppointments, fetchProfessionals } from "~/lib/clinic.client";
import type { AppointmentView, ProfessionalView } from "~/api/domain/domain.types";

export type LeireStatus =
  | "off"
  | "idle" // listening in background for wake word
  | "listening" // wake word heard, capturing a command
  | "thinking"
  | "speaking";

interface LeireState {
  enabled: boolean;
  status: LeireStatus;
  supported: boolean;
  micActive: boolean;
  transcript: string;
  lastReply: string;
  assistantName: string;
  wakeWord: string;
  /** Toggle the whole assistant on/off. */
  setEnabled: (v: boolean) => void;
  /** Manually trigger a command capture (button press = same as wake word). */
  activate: () => void;
  /** Submit a typed command (keyboard fallback). */
  ask: (text: string) => Promise<void>;
}

const Ctx = createContext<LeireState | null>(null);

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function endOfToday(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export function LeireProvider({ children }: { children: ReactNode }) {
  const { config } = useConfigurables();
  const navigate = useNavigate();

  const va = config?.voiceAssistant;
  const assistantName = va?.name ?? "Leire";
  const wakeWord = va?.wakeWord ?? "Leire";
  const language = va?.language ?? "es-ES";
  const voiceGender = va?.voiceGender ?? "female";
  const speechRate = va?.speechRate ?? 1;
  const speakResponses = va?.speakResponses ?? true;
  const autoListen = va?.autoListen ?? true;
  const featureEnabled = config?.features?.enableVoiceAssistant ?? true;

  const [enabled, setEnabledState] = useState(false);
  const [status, setStatus] = useState<LeireStatus>("off");
  const [transcript, setTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");

  // Live clinic data used to answer questions, kept fresh.
  const dataRef = useRef<{ professionals: ProfessionalView[]; appointments: AppointmentView[] }>({
    professionals: [],
    appointments: [],
  });

  // Mode: are we currently capturing a command (post-wake-word)?
  const capturingRef = useRef(false);
  const captureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<LeireStatus>("off");
  statusRef.current = status;

  const supported = isSpeechRecognitionSupported();

  const refreshData = useCallback(async () => {
    try {
      const [professionals, appointments] = await Promise.all([
        fetchProfessionals(),
        fetchAppointments({ from: startOfToday(), to: endOfToday() }),
      ]);
      dataRef.current = { professionals, appointments };
    } catch {
      // ignore — keep stale data
    }
  }, []);

  const buildContext = useCallback(
    (): LeireData => ({
      assistantName,
      professionals: dataRef.current.professionals,
      appointments: dataRef.current.appointments,
    }),
    [assistantName],
  );

  const respond = useCallback(
    (reply: { text: string; navigate?: string }) => {
      setLastReply(reply.text);
      if (reply.navigate) {
        navigate(reply.navigate);
      }
      if (speakResponses) {
        setStatus("speaking");
        speak(reply.text, {
          lang: language,
          gender: voiceGender,
          rate: speechRate,
          onEnd: () => {
            setStatus(enabled ? "idle" : "off");
          },
        });
      } else {
        setStatus(enabled ? "idle" : "off");
      }
    },
    [navigate, speakResponses, language, voiceGender, speechRate, enabled],
  );

  const handleCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) {
        setStatus(enabled ? "idle" : "off");
        return;
      }
      setStatus("thinking");
      await refreshData();
      const reply = await interpretQuery(commandText, buildContext());
      respond(reply);
    },
    [enabled, refreshData, buildContext, respond],
  );

  // Begin capturing a command after wake word / button press.
  const beginCapture = useCallback(() => {
    capturingRef.current = true;
    setTranscript("");
    setStatus("listening");
    cancelSpeech();
    if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
    // Safety timeout — stop capturing if nothing final arrives.
    captureTimerRef.current = setTimeout(() => {
      if (capturingRef.current) {
        capturingRef.current = false;
        setStatus(enabled ? "idle" : "off");
      }
    }, 9000);
  }, [enabled]);

  const onTranscript = useCallback((text: string, isFinal: boolean) => {
    if (capturingRef.current) {
      setTranscript(text);
    } else if (!isFinal && containsWakeWord(text, wakeWord)) {
      // Wake word detected mid-utterance — begin capturing immediately.
      beginCapture();
      const after = stripWakeWord(text, wakeWord);
      if (after) setTranscript(after);
    }
  }, [wakeWord, beginCapture]);

  const onFinal = useCallback(
    (text: string) => {
      if (capturingRef.current) {
        if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
        capturingRef.current = false;
        const command = stripWakeWord(text, wakeWord);
        void handleCommand(command || text);
        return;
      }
      // Not capturing: check for wake word in the final phrase.
      if (containsWakeWord(text, wakeWord)) {
        const command = stripWakeWord(text, wakeWord);
        if (command) {
          // Wake word + command in one phrase.
          void handleCommand(command);
        } else {
          // Just the wake word — start listening for the command.
          beginCapture();
        }
      }
    },
    [wakeWord, handleCommand, beginCapture],
  );

  const { listening, start, stop } = useSpeechRecognition({
    lang: language,
    onTranscript,
    onFinal,
  });

  const setEnabled = useCallback(
    (v: boolean) => {
      setEnabledState(v);
      if (v) {
        setStatus("idle");
        void refreshData();
        start();
      } else {
        capturingRef.current = false;
        cancelSpeech();
        stop();
        setStatus("off");
        setTranscript("");
      }
    },
    [start, stop, refreshData],
  );

  const activate = useCallback(() => {
    if (!enabled) {
      setEnabled(true);
      // Give recognition a moment, then begin capture.
      setTimeout(() => beginCapture(), 350);
      return;
    }
    beginCapture();
  }, [enabled, setEnabled, beginCapture]);

  const ask = useCallback(
    async (text: string) => {
      setTranscript(text);
      await handleCommand(text);
    },
    [handleCommand],
  );

  // Auto-enable after login if configured (and supported).
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!featureEnabled || !supported) return;
    if (autoListen && !autoStartedRef.current) {
      autoStartedRef.current = true;
      // Note: browsers require a user gesture for the mic; we set idle and the
      // first interaction (or button) will grant permission. We still call
      // start() so that if permission is already granted, listening resumes.
      setEnabledState(true);
      setStatus("idle");
      void refreshData();
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureEnabled, supported, autoListen]);

  useEffect(() => {
    return () => {
      if (captureTimerRef.current) clearTimeout(captureTimerRef.current);
      cancelSpeech();
    };
  }, []);

  const value = useMemo<LeireState>(
    () => ({
      enabled: featureEnabled && enabled,
      status: featureEnabled ? status : "off",
      supported,
      micActive: listening,
      transcript,
      lastReply,
      assistantName,
      wakeWord,
      setEnabled,
      activate,
      ask,
    }),
    [
      featureEnabled,
      enabled,
      status,
      supported,
      listening,
      transcript,
      lastReply,
      assistantName,
      wakeWord,
      setEnabled,
      activate,
      ask,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLeire(): LeireState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLeire must be used within <LeireProvider>");
  return ctx;
}
