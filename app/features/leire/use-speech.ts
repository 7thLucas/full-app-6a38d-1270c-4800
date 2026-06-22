import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in lib.dom for all targets).
type SpeechRecognitionResultLike = {
  0: { transcript: string };
  isFinal: boolean;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResultLike };
};
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface UseSpeechRecognitionOptions {
  lang: string;
  /** Called continuously with the latest (interim or final) transcript. */
  onTranscript?: (text: string, isFinal: boolean) => void;
  /** Called once a final phrase is recognized. */
  onFinal?: (text: string) => void;
}

/**
 * Continuous speech recognition with auto-restart. Designed to run in the
 * background after login so the wake word can be detected at any time.
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions) {
  const { lang, onTranscript, onFinal } = options;
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => isSpeechRecognitionSupported());
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantListeningRef = useRef(false);
  const cbRef = useRef({ onTranscript, onFinal });

  useEffect(() => {
    cbRef.current = { onTranscript, onFinal };
  }, [onTranscript, onFinal]);

  const buildRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setListening(true);
    rec.onend = () => {
      setListening(false);
      // Auto-restart if we still want to be listening (continuous mode often stops).
      if (wantListeningRef.current) {
        try {
          rec.start();
        } catch {
          // ignore — will be retried on next tick
        }
      }
    };
    rec.onerror = (e) => {
      // "no-speech" / "aborted" are common and benign; keep going.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantListeningRef.current = false;
        setListening(false);
      }
    };
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          const finalText = text.trim();
          cbRef.current.onTranscript?.(finalText, true);
          if (finalText) cbRef.current.onFinal?.(finalText);
        } else {
          interim += text;
        }
      }
      if (interim) cbRef.current.onTranscript?.(interim.trim(), false);
    };
    return rec;
  }, [lang]);

  const start = useCallback(() => {
    if (!supported) return;
    wantListeningRef.current = true;
    if (!recRef.current) recRef.current = buildRecognition();
    try {
      recRef.current?.start();
    } catch {
      // Already started — ignore.
    }
  }, [supported, buildRecognition]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  // Rebuild recognizer when language changes.
  useEffect(() => {
    const wasListening = wantListeningRef.current;
    if (recRef.current) {
      wantListeningRef.current = false;
      try {
        recRef.current.abort();
      } catch {
        // ignore
      }
      recRef.current = null;
    }
    if (wasListening) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      try {
        recRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { listening, supported, start, stop };
}

// ── Text-to-speech ────────────────────────────────────────────────────────────

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(lang: string, gender: string): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const langPrefix = lang.split("-")[0].toLowerCase();
  const sameLang = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langPrefix),
  );
  const pool = sameLang.length ? sameLang : voices;

  // Heuristic female-name matching across common Spanish/English TTS voices.
  const femaleHints = [
    "female",
    "mujer",
    "mónica",
    "monica",
    "marisol",
    "helena",
    "elvira",
    "lucia",
    "lucía",
    "paulina",
    "samantha",
    "google español",
    "google us english",
    "zira",
  ];
  const maleHints = ["male", "hombre", "jorge", "diego", "carlos", "google uk english male", "david"];
  const hints = gender === "male" ? maleHints : femaleHints;

  const exactLangMatch = pool.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  const byHint = pool.find((v) =>
    hints.some((h) => v.name.toLowerCase().includes(h)),
  );

  return byHint ?? exactLangMatch ?? pool[0] ?? null;
}

export interface SpeakOptions {
  lang: string;
  gender: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, options: SpeakOptions): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) {
    options.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang;
  utterance.rate = options.rate ?? 1;
  utterance.pitch = 1;
  const voice = pickVoice(options.lang, options.gender);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onEnd?.();

  synth.speak(utterance);
}

export function cancelSpeech(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
