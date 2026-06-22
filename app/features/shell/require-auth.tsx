import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Stethoscope } from "lucide-react";
import { useAuth } from "~/modules/authentication";
import { AppShell } from "./app-shell";
import { LeireProvider } from "~/features/leire/leire-provider";
import { LeireOrb } from "~/features/leire/leire-orb";

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground animate-leire-breath">
          <Stethoscope className="h-6 w-6" />
        </span>
        <p className="text-sm">Cargando…</p>
      </div>
    </div>
  );
}

/**
 * Gates a page behind authentication. Redirects to /login when not logged in,
 * and wraps authenticated content in the app shell + Leire voice assistant.
 */
export function RequireClinicAuth({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <FullScreenLoader />;

  return (
    <LeireProvider>
      <AppShell>{children}</AppShell>
      <LeireOrb />
    </LeireProvider>
  );
}
