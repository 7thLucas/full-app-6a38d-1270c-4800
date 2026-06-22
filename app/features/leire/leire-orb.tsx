import { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Send, X } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useLeire, type LeireStatus } from "./leire-provider";

function statusLabel(status: LeireStatus, name: string, wakeWord: string): string {
  switch (status) {
    case "idle":
      return `Di «${wakeWord}» para hablar`;
    case "listening":
      return "Escuchando…";
    case "thinking":
      return "Pensando…";
    case "speaking":
      return `${name} responde…`;
    case "off":
    default:
      return `Activar a ${name}`;
  }
}

/** Animated voice orb. Coral when listening, teal otherwise. */
function Orb({ status, onClick }: { status: LeireStatus; onClick: () => void }) {
  const isListening = status === "listening";
  const isSpeaking = status === "speaking";
  const isThinking = status === "thinking";
  const isActive = isListening || isSpeaking || isThinking;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Asistente de voz Leire"
      className={cn(
        "relative grid h-16 w-16 place-items-center rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        isListening
          ? "bg-accent text-accent-foreground"
          : "bg-primary text-primary-foreground hover:brightness-105",
        status === "off" && "opacity-90",
      )}
    >
      {/* Expanding rings while listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-accent/40 animate-leire-ring" />
          <span
            className="absolute inset-0 rounded-full bg-accent/30 animate-leire-ring"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}
      {/* Breathing while idle/active */}
      <span
        className={cn(
          "absolute inset-1 rounded-full",
          isListening ? "bg-accent/30" : "bg-primary-foreground/10",
          isActive && "animate-leire-breath",
        )}
      />
      <span className="relative">
        {status === "off" ? (
          <MicOff className="h-6 w-6" />
        ) : isListening ? (
          <Mic className="h-6 w-6" />
        ) : isThinking ? (
          <Sparkles className="h-6 w-6 animate-pulse" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </span>
    </button>
  );
}

function Waveform() {
  return (
    <div className="flex items-end gap-1 h-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-accent animate-leire-bar"
          style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export function LeireOrb() {
  const leire = useLeire();
  const [typed, setTyped] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  // Auto-open the panel when there's activity.
  useEffect(() => {
    if (leire.status === "listening" || leire.status === "thinking" || leire.status === "speaking") {
      setShowPanel(true);
    }
  }, [leire.status]);

  if (!leire.supported && !leire.lastReply) {
    // Voice not supported — still expose typed assistant via the panel.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = typed.trim();
    if (!text) return;
    setTyped("");
    setShowPanel(true);
    await leire.ask(text);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {showPanel && (
        <div className="w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-border bg-card text-card-foreground shadow-xl animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-semibold">{leire.assistantName}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPanel(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              {leire.status === "listening" && <Waveform />}
              <span
                className={cn(
                  "font-medium",
                  leire.status === "listening" ? "text-accent" : "text-muted-foreground",
                )}
              >
                {statusLabel(leire.status, leire.assistantName, leire.wakeWord)}
              </span>
            </div>

            {leire.transcript && (
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tú
                </span>
                <p className="mt-0.5">{leire.transcript}</p>
              </div>
            )}

            {leire.lastReply && (
              <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {leire.assistantName}
                </span>
                <p className="mt-0.5 text-foreground">{leire.lastReply}</p>
              </div>
            )}

            {!leire.supported && (
              <p className="text-xs text-muted-foreground">
                Tu navegador no admite reconocimiento de voz. Puedes escribir tu
                consulta abajo.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={`Escribe a ${leire.assistantName}…`}
                className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" size="icon" className="h-9 w-9" aria-label="Enviar">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={leire.enabled}
                  onChange={(e) => leire.setEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--primary)]"
                />
                Escucha en segundo plano
              </label>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  leire.micActive ? "text-accent" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    leire.micActive ? "bg-accent" : "bg-muted-foreground/40",
                  )}
                />
                {leire.micActive ? "Micrófono activo" : "Micrófono en pausa"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!showPanel && leire.status !== "off" && (
          <span className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-md border border-border">
            {statusLabel(leire.status, leire.assistantName, leire.wakeWord)}
          </span>
        )}
        <Orb
          status={leire.status}
          onClick={() => {
            setShowPanel(true);
            leire.activate();
          }}
        />
      </div>
    </div>
  );
}
