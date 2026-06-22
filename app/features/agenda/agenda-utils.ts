import {
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "~/api/domain/domain.types";

export function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dayBounds(date: Date): { from: string; to: string } {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Build an ISO datetime for a given day + "HH:MM" string. */
export function isoFor(date: Date, time: string): string {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

export function statusBadgeVariant(
  status: AppointmentStatus,
): "default" | "secondary" | "success" | "muted" | "destructive" | "accent" {
  switch (status) {
    case "confirmada":
      return "success";
    case "en_curso":
      return "accent";
    case "completada":
      return "muted";
    case "cancelada":
      return "destructive";
    case "programada":
    default:
      return "secondary";
  }
}

export function statusLabel(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status] ?? status;
}
