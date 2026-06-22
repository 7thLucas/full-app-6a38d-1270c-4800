import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  CalendarDays,
  Users,
  UserRound,
  LogOut,
  Menu,
  X,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useConfigurables } from "~/modules/configurables";
import { apiRequest } from "~/lib/api.client";
import { useClinicUser } from "./use-clinic-user";
import type { Privilege } from "~/api/domain/domain.types";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  privilege: Privilege;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/agenda", label: "Agenda", icon: CalendarDays, privilege: "agenda.view" },
  { to: "/profesionales", label: "Profesionales", icon: Stethoscope, privilege: "professionals.view" },
  { to: "/pacientes", label: "Pacientes", icon: Users, privilege: "patients.view" },
];

function Logo({ appName, logoUrl }: { appName: string; logoUrl?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {logoUrl ? (
        <img src={logoUrl} alt={appName} className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </span>
      )}
      <span className="text-sm font-bold leading-tight text-sidebar-foreground">
        {appName}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { config } = useConfigurables();
  const clinicUser = useClinicUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const appName = config?.appName ?? "LEIRE DENTAL Y CLÍNICA";
  const tagline = config?.clinicTagline ?? "";
  const logoUrl = config?.logoUrl;

  const visibleItems = NAV_ITEMS.filter((item) => clinicUser.can(item.privilege));

  const handleLogout = async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Logo appName={appName} logoUrl={logoUrl} />
        {tagline && (
          <p className="mt-2 text-xs leading-snug text-muted-foreground">{tagline}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {clinicUser.displayName}
            </p>
            <Badge variant="accent" className="mt-0.5">
              {clinicUser.clinicRoleLabel}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-sidebar-border bg-sidebar">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-navbar px-4 lg:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-foreground">
              {pageTitle(location.pathname)}
            </h1>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/profesionales")) return "Profesionales";
  if (pathname.startsWith("/pacientes")) return "Pacientes";
  return "Agenda";
}
