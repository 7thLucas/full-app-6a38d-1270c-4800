import { useState } from "react";
import { Modal } from "~/components/ui/modal";
import { Button } from "~/components/ui/button";
import { useConfigurables } from "~/modules/configurables";
import { createAppointment } from "~/lib/clinic.client";
import { isoFor } from "./agenda-utils";
import type { ProfessionalView, AppointmentView } from "~/api/domain/domain.types";

interface Props {
  open: boolean;
  onClose: () => void;
  date: Date;
  professionals: ProfessionalView[];
  defaultProfessionalId?: string;
  defaultTime?: string;
  onCreated: (a: AppointmentView) => void;
}

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewAppointmentModal({
  open,
  onClose,
  date,
  professionals,
  defaultProfessionalId,
  defaultTime,
  onCreated,
}: Props) {
  const { config } = useConfigurables();
  const treatmentTypes = config?.treatmentTypes ?? [];

  const [patientName, setPatientName] = useState("");
  const [professionalId, setProfessionalId] = useState(
    defaultProfessionalId ?? professionals[0]?.id ?? "",
  );
  const [treatment, setTreatment] = useState(treatmentTypes[0]?.name ?? "");
  const [time, setTime] = useState(defaultTime ?? "09:00");
  const [duration, setDuration] = useState(
    treatmentTypes[0]?.durationMinutes ?? config?.agenda?.slotMinutes ?? 30,
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPatientName("");
    setTreatment(treatmentTypes[0]?.name ?? "");
    setTime("09:00");
    setNotes("");
    setError(null);
  };

  const handleTreatmentChange = (name: string) => {
    setTreatment(name);
    const t = treatmentTypes.find((x) => x.name === name);
    if (t?.durationMinutes) setDuration(t.durationMinutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patientName.trim()) {
      setError("Indica el nombre del paciente.");
      return;
    }
    if (!professionalId) {
      setError("Selecciona un profesional.");
      return;
    }
    setSaving(true);
    const created = await createAppointment({
      patientName: patientName.trim(),
      professionalId,
      treatment,
      start: isoFor(date, time),
      durationMinutes: Number(duration),
      status: "programada",
      notes: notes.trim(),
    });
    setSaving(false);
    if (created) {
      onCreated(created);
      reset();
      onClose();
    } else {
      setError("No se pudo guardar la cita. Inténtalo de nuevo.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva cita"
      description="Programa una cita en la agenda."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Paciente</label>
          <input
            className={fieldClass}
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nombre del paciente"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Profesional</label>
          <select
            className={fieldClass}
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.specialty || "General"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tratamiento</label>
            <select
              className={fieldClass}
              value={treatment}
              onChange={(e) => handleTreatmentChange(e.target.value)}
            >
              {treatmentTypes.length === 0 && <option value="">General</option>}
              {treatmentTypes.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Duración (min)</label>
            <input
              type="number"
              min={5}
              step={5}
              className={fieldClass}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Hora</label>
          <input
            type="time"
            className={fieldClass}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notas</label>
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones (opcional)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cita"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
