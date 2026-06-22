import { useEffect, useState } from "react";
import { Plus, Stethoscope } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Modal } from "~/components/ui/modal";
import { useClinicUser } from "~/features/shell/use-clinic-user";
import { createProfessional, fetchProfessionals } from "~/lib/clinic.client";
import type { ProfessionalView } from "~/api/domain/domain.types";

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const COLORS = ["#0fb8b0", "#34c0b8", "#5aa9e6", "#f5b945", "#ff8a6b", "#9b8cff", "#0e9c95"];

export function ProfessionalsView() {
  const clinicUser = useClinicUser();
  const canManage = clinicUser.can("professionals.manage");

  const [items, setItems] = useState<ProfessionalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await fetchProfessionals());
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const created = await createProfessional({ name: name.trim(), specialty: specialty.trim(), color });
    setSaving(false);
    if (created) {
      setItems((p) => [...p, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setSpecialty("");
      setColor(COLORS[0]);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Equipo clínico y especialidades. Asigna citas a cada profesional desde la agenda.
        </p>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo profesional
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="grid h-48 place-items-center text-sm text-muted-foreground">
            Aún no hay profesionales.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: p.color }} />
              <CardContent className="flex items-center gap-3 pt-5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
                  style={{ backgroundColor: p.color }}
                >
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{p.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {p.specialty || "General"}
                  </p>
                </div>
                <Badge variant={p.active ? "success" : "muted"}>
                  {p.active ? "Activo" : "Inactivo"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo profesional">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr./Dra. Nombre Apellido"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Especialidad</label>
            <input
              className={fieldClass}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Odontología, Ortodoncia, Estética…"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color en la agenda</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full ring-offset-2 ring-offset-card transition"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px var(--ring)` : "none",
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
