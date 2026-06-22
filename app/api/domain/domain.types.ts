// Shared domain types for LEIRE DENTAL Y CLÍNICA.
// Safe to import from both client and server (no node/mongoose imports here).

/** Clinic roles — richer than the auth module's base roles. Stored in user.profile.clinicRole. */
export enum ClinicRole {
  Administrador = "administrador",
  Dentista = "dentista",
  Recepcionista = "recepcionista",
  Auxiliar = "auxiliar",
  Director = "director",
}

export const CLINIC_ROLE_LABELS: Record<ClinicRole, string> = {
  [ClinicRole.Administrador]: "Administrador",
  [ClinicRole.Dentista]: "Dentista / Especialista",
  [ClinicRole.Recepcionista]: "Recepcionista",
  [ClinicRole.Auxiliar]: "Auxiliar",
  [ClinicRole.Director]: "Director / Gestor",
};

/** Granular privileges that gate UI and actions. */
export type Privilege =
  | "agenda.view"
  | "agenda.manage"
  | "professionals.view"
  | "professionals.manage"
  | "patients.view"
  | "patients.manage"
  | "users.manage"
  | "reports.view";

/** Role → privilege matrix. Drives role-based access across the app. */
export const ROLE_PRIVILEGES: Record<ClinicRole, Privilege[]> = {
  [ClinicRole.Administrador]: [
    "agenda.view",
    "agenda.manage",
    "professionals.view",
    "professionals.manage",
    "patients.view",
    "patients.manage",
    "users.manage",
    "reports.view",
  ],
  [ClinicRole.Director]: [
    "agenda.view",
    "professionals.view",
    "patients.view",
    "reports.view",
  ],
  [ClinicRole.Dentista]: [
    "agenda.view",
    "agenda.manage",
    "professionals.view",
    "patients.view",
    "patients.manage",
  ],
  [ClinicRole.Recepcionista]: [
    "agenda.view",
    "agenda.manage",
    "professionals.view",
    "patients.view",
    "patients.manage",
  ],
  [ClinicRole.Auxiliar]: ["agenda.view", "professionals.view", "patients.view"],
};

export function privilegesForRole(role?: string | null): Privilege[] {
  if (role && role in ROLE_PRIVILEGES) {
    return ROLE_PRIVILEGES[role as ClinicRole];
  }
  return ROLE_PRIVILEGES[ClinicRole.Recepcionista];
}

export function hasPrivilege(role: string | null | undefined, priv: Privilege): boolean {
  return privilegesForRole(role).includes(priv);
}

export type AppointmentStatus =
  | "programada"
  | "confirmada"
  | "en_curso"
  | "completada"
  | "cancelada";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
};

export interface ProfessionalView {
  id: string;
  name: string;
  specialty: string;
  color: string;
  active: boolean;
}

export interface PatientView {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface AppointmentView {
  id: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  treatment: string;
  /** ISO date-time string for the start of the appointment. */
  start: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes: string;
}
