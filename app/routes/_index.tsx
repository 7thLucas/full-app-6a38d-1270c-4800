import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Stethoscope } from "lucide-react";
import { useAuth } from "~/modules/authentication";

export default function IndexPage() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(isAuthenticated ? "/agenda" : "/login", { replace: true });
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground animate-leire-breath">
        <Stethoscope className="h-6 w-6" />
      </span>
    </div>
  );
}
