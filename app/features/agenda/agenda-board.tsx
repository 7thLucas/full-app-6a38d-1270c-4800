import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useConfigurables } from "~/modules/configurables";
import { useClinicUser } from "~/features/shell/use-clinic-user";
import {
  fetchAppointments,
  fetchProfessionals,
} from "~/lib/clinic.client";
import type { AppointmentView, ProfessionalView } from "~/api/domain/domain.types";
import {
  addDays,
  dayBounds,
  formatLongDate,
  formatTime,
  minutesFromMidnight,
  statusBadgeVariant,
  statusLabel,
} from "./agenda-utils";
import { NewAppointmentModal } from "./new-appointment-modal";

const HOUR_HEIGHT = 64; // px per hour

function AppointmentCard({
  appt,
  color,
  startHour,
}: {
  appt: AppointmentView;
  color: string;
  startHour: number;
}) {
  const top = ((minutesFromMidnight(appt.start) - startHour * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max((appt.durationMinutes / 60) * HOUR_HEIGHT - 4, 28);
  return (
    <div
      className="absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1.5 text-xs shadow-sm"
      style={{
        top,
        height,
        backgroundColor: `${color}1a`,
        borderColor: `${color}55`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <p className="truncate font-semibold text-foreground">{appt.patientName}</p>
      <p className="truncate text-muted-foreground">
        {formatTime(appt.start)} · {appt.treatment || "Cita"}
      </p>
      {height > 50 && (
        <Badge variant={statusBadgeVariant(appt.status)} className="mt-1">
          {statusLabel(appt.status)}
        </Badge>
      )}
    </div>
  );
}

export function AgendaBoard() {
  const { config } = useConfigurables();
  const clinicUser = useClinicUser();

  const startHour = config?.agenda?.dayStartHour ?? 8;
  const endHour = config?.agenda?.dayEndHour ?? 20;
  const showColumns = config?.features?.showProfessionalColumns ?? true;

  const [date, setDate] = useState<Date>(() => new Date());
  const [professionals, setProfessionals] = useState<ProfessionalView[]>([]);
  const [appointments, setAppointments] = useState<AppointmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPro, setModalPro] = useState<string | undefined>(undefined);

  const canManage = clinicUser.can("agenda.manage");

  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = startHour; h < endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  const load = async (d: Date) => {
    setLoading(true);
    const bounds = dayBounds(d);
    const [pros, appts] = await Promise.all([
      fetchProfessionals(),
      fetchAppointments(bounds),
    ]);
    setProfessionals(pros.filter((p) => p.active));
    setAppointments(appts);
    setLoading(false);
  };

  useEffect(() => {
    void load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const colorFor = (proId: string) =>
    professionals.find((p) => p.id === proId)?.color ?? "#0fb8b0";

  const columns = showColumns && professionals.length > 0 ? professionals : null;

  const handleCreated = (a: AppointmentView) => {
    setAppointments((prev) =>
      [...prev, a].sort((x, y) => x.start.localeCompare(y.start)),
    );
  };

  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDate((d) => addDays(d, -1))} aria-label="Día anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setDate((d) => addDays(d, 1))} aria-label="Día siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant={isToday ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setDate(new Date())}
          >
            Hoy
          </Button>
          <div className="ml-1 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold capitalize text-foreground">
              {formatLongDate(date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {appointments.length} {appointments.length === 1 ? "cita" : "citas"}
          </Badge>
          {canManage && (
            <Button
              onClick={() => {
                setModalPro(undefined);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nueva cita
            </Button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="grid h-64 place-items-center text-sm text-muted-foreground">
            Cargando agenda…
          </div>
        ) : columns ? (
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {/* Time gutter */}
              <div className="sticky left-0 z-10 w-16 shrink-0 border-r border-border bg-card">
                <div className="h-12 border-b border-border" />
                {hours.map((h) => (
                  <div
                    key={h}
                    className="relative border-b border-border/60 text-right"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="absolute right-2 top-1 text-xs text-muted-foreground">
                      {String(h).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Professional columns */}
              {columns.map((pro) => {
                const colAppts = appointments.filter(
                  (a) => a.professionalId === pro.id,
                );
                return (
                  <div
                    key={pro.id}
                    className="w-56 shrink-0 border-r border-border last:border-r-0"
                  >
                    <div className="flex h-12 items-center gap-2 border-b border-border px-3">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: pro.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {pro.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {pro.specialty || "General"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="relative"
                      style={{ height: hours.length * HOUR_HEIGHT }}
                    >
                      {hours.map((h, i) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-b border-border/40"
                          style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                          onClick={() => {
                            if (!canManage) return;
                            setModalPro(pro.id);
                            setModalOpen(true);
                          }}
                        />
                      ))}
                      {colAppts.map((a) => (
                        <AppointmentCard
                          key={a.id}
                          appt={a}
                          color={pro.color}
                          startHour={startHour}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Simple list fallback (columns disabled or no professionals)
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                No hay citas para este día.
              </div>
            ) : (
              appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <span
                    className="h-10 w-1 rounded-full"
                    style={{ backgroundColor: colorFor(a.professionalId) }}
                  />
                  <div className="w-16 text-sm font-semibold text-foreground">
                    {formatTime(a.start)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{a.patientName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {a.treatment || "Cita"} · {a.professionalName}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(a.status)}>{statusLabel(a.status)}</Badge>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        date={date}
        professionals={professionals}
        defaultProfessionalId={modalPro}
        onCreated={handleCreated}
      />
    </div>
  );
}
