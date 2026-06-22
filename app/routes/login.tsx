import { useState } from "react";
import { useNavigate } from "react-router";
import { Stethoscope, Sparkles, Mic } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useConfigurables } from "~/modules/configurables";
import { apiRequest } from "~/lib/api.client";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function LoginRoute() {
  const { config } = useConfigurables();
  const navigate = useNavigate();

  const appName = config?.appName ?? "LEIRE DENTAL Y CLÍNICA";
  const tagline = config?.clinicTagline ?? "Gestión clínica con voz.";
  const welcome = config?.welcomeMessage ?? "";
  const assistantName = config?.voiceAssistant?.name ?? "Leire";
  const logoUrl = config?.logoUrl;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      data: { email, password },
    });
    setLoading(false);
    if (res.success) {
      window.location.href = "/agenda";
    } else {
      setError(res.message ?? "Credenciales no válidas.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="h-11 w-11 rounded-xl object-cover" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground/15">
              <Stethoscope className="h-6 w-6" />
            </span>
          )}
          <span className="text-lg font-bold">{appName}</span>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            Asistente de voz {assistantName}
          </div>
          <h2 className="text-3xl font-bold leading-tight">{tagline}</h2>
          {welcome && (
            <p className="max-w-md text-primary-foreground/80">{welcome}</p>
          )}
          <div className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <Mic className="h-5 w-5" />
            </span>
            <p className="text-sm text-primary-foreground/90">
              Tras iniciar sesión, di «{assistantName}» y gestiona tu agenda con
              las manos libres.
            </p>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">
          Gestión integral para clínicas dentales y estéticas.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Stethoscope className="h-5 w-5" />
              </span>
              <span className="text-base font-bold text-foreground">{appName}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede con tu cuenta de la clínica.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                className={fieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@clinica.es"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <input
                type="password"
                className={fieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Accediendo…" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Cuentas de demostración</p>
            <ul className="mt-1.5 space-y-1">
              <li>Dentista — marta@leireclinica.es</li>
              <li>Recepción — recepcion@leireclinica.es</li>
              <li>Dirección — director@leireclinica.es</li>
            </ul>
            <p className="mt-1.5">Contraseña: <span className="font-mono">Leire2026!</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
