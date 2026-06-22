import { apiGet, apiRequest } from "~/lib/api.client";
import type {
  AppointmentView,
  ProfessionalView,
  PatientView,
  AppointmentStatus,
} from "~/api/domain/domain.types";

// ── Professionals ─────────────────────────────────────────────────────────────
export async function fetchProfessionals(): Promise<ProfessionalView[]> {
  const res = await apiGet<ProfessionalView[]>("/api/clinic/professionals");
  return res.success && res.data ? res.data : [];
}

export async function createProfessional(input: {
  name: string;
  specialty?: string;
  color?: string;
}): Promise<ProfessionalView | null> {
  const res = await apiRequest<ProfessionalView>("/api/clinic/professionals", {
    method: "POST",
    data: input,
  });
  return res.success && res.data ? res.data : null;
}

// ── Patients ──────────────────────────────────────────────────────────────────
export async function fetchPatients(): Promise<PatientView[]> {
  const res = await apiGet<PatientView[]>("/api/clinic/patients");
  return res.success && res.data ? res.data : [];
}

export async function createPatient(input: {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}): Promise<PatientView | null> {
  const res = await apiRequest<PatientView>("/api/clinic/patients", {
    method: "POST",
    data: input,
  });
  return res.success && res.data ? res.data : null;
}

// ── Appointments ──────────────────────────────────────────────────────────────
export async function fetchAppointments(range?: {
  from?: string;
  to?: string;
}): Promise<AppointmentView[]> {
  const res = await apiGet<AppointmentView[]>(
    "/api/clinic/appointments",
    range,
  );
  return res.success && res.data ? res.data : [];
}

export async function createAppointment(input: {
  patientName: string;
  professionalId: string;
  treatment?: string;
  start: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  notes?: string;
}): Promise<AppointmentView | null> {
  const res = await apiRequest<AppointmentView>("/api/clinic/appointments", {
    method: "POST",
    data: input,
  });
  return res.success && res.data ? res.data : null;
}

export async function updateAppointment(
  id: string,
  input: Partial<{
    start: string;
    durationMinutes: number;
    status: AppointmentStatus;
    professionalId: string;
    treatment: string;
    notes: string;
    patientName: string;
  }>,
): Promise<AppointmentView | null> {
  const res = await apiRequest<AppointmentView>(
    `/api/clinic/appointments/${id}`,
    { method: "PATCH", data: input },
  );
  return res.success && res.data ? res.data : null;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const res = await apiRequest(`/api/clinic/appointments/${id}`, {
    method: "DELETE",
  });
  return !!res.success;
}
