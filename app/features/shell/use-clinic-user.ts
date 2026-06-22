import { useMemo } from "react";
import { useAuth } from "~/modules/authentication";
import {
  ClinicRole,
  CLINIC_ROLE_LABELS,
  privilegesForRole,
  hasPrivilege,
  type Privilege,
} from "~/api/domain/domain.types";

export interface ClinicUser {
  loading: boolean;
  isAuthenticated: boolean;
  displayName: string;
  email: string;
  clinicRole: ClinicRole;
  clinicRoleLabel: string;
  privileges: Privilege[];
  can: (priv: Privilege) => boolean;
}

/**
 * Resolves the current user's clinic role + privileges from the auth profile.
 * Admins map to Administrador. Falls back to Recepcionista for safety.
 */
export function useClinicUser(): ClinicUser {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  return useMemo(() => {
    const profileRole = user?.profile?.clinicRole as ClinicRole | undefined;
    const clinicRole =
      profileRole ??
      (isAdmin ? ClinicRole.Administrador : ClinicRole.Recepcionista);
    const privileges = privilegesForRole(clinicRole);
    const displayName =
      (user?.profile?.displayName as string | undefined) ??
      user?.username ??
      "Usuario";

    return {
      loading,
      isAuthenticated,
      displayName,
      email: user?.email ?? "",
      clinicRole,
      clinicRoleLabel: CLINIC_ROLE_LABELS[clinicRole] ?? "Usuario",
      privileges,
      can: (priv: Privilege) => hasPrivilege(clinicRole, priv),
    };
  }, [user, loading, isAuthenticated, isAdmin]);
}
