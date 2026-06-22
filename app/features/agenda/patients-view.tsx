import { useEffect, useState } from "react";
import { Plus, UserRound, Phone, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Modal } from "~/components/ui/modal";
import { useClinicUser } from "~/features/shell/use-clinic-user";
import { useConfigurables } from "~/modules/configurables";
import { createPatient, fetchPatients } from "~/lib/clinic.client";
import type { PatientView } from "~/api/domain/domain.types";

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PatientsView() {
  const clinicUser = useClinicUser();
  const { config } = useConfigurables();
  const enabled = config?.features?.enablePatientRegistry ?? true;
  const canManage = clinicUser.can("patients.manage");

  const [items, setItems] = useState<PatientView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await fetchPatients());
    setLoading(false);
  };

  useEffect(() => {
    if (enabled) void load();
    else setLoading(false);
  }, [enabled]);

  const filtered = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const created = await createPatient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
    });
    setSaving(false);
    if (created) {
      setItems((p) => [...p, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setOpen(false);
    }
  };

  if (!enabled) {
    return (
      <Card>
        <CardContent className="grid h-48 place-items-center text-sm text-muted-foreground">
          El registro de pacientes está desactivado en la configuración.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          className="h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Buscar paciente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo paciente
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="grid h-48 place-items-center text-sm text-muted-foreground">
            {items.length === 0 ? "Aún no hay pacientes." : "Sin resultados."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <p className="font-semibold text-foreground">{p.name}</p>
                </div>
                {p.phone && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" /> {p.phone}
                  </p>
                )}
                {p.email && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" /> {p.email}
                  </p>
                )}
                {p.notes && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {p.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo paciente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellidos"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Teléfono</label>
              <input
                className={fieldClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="600 000 000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                className={fieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.es"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notas</label>
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alergias, observaciones…"
            />
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
