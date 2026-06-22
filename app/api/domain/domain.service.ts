import type { DocumentType } from "@typegoose/typegoose";
import { ProfessionalModel, Professional } from "./professional.model";
import { PatientModel, Patient } from "./patient.model";
import { AppointmentModel, Appointment } from "./appointment.model";
import type {
  ProfessionalView,
  PatientView,
  AppointmentView,
} from "./domain.types";

function professionalView(p: DocumentType<Professional>): ProfessionalView {
  return {
    id: p._id.toString(),
    name: p.name,
    specialty: p.specialty ?? "",
    color: p.color ?? "#0fb8b0",
    active: p.active ?? true,
  };
}

function patientView(p: DocumentType<Patient>): PatientView {
  return {
    id: p._id.toString(),
    name: p.name,
    phone: p.phone ?? "",
    email: p.email ?? "",
    notes: p.notes ?? "",
  };
}

function appointmentView(
  a: DocumentType<Appointment>,
  professionalName: string,
): AppointmentView {
  return {
    id: a._id.toString(),
    patientName: a.patientName,
    professionalId: a.professionalId,
    professionalName,
    treatment: a.treatment ?? "",
    start: (a.start as Date).toISOString(),
    durationMinutes: a.durationMinutes ?? 30,
    status: (a.status as AppointmentView["status"]) ?? "programada",
    notes: a.notes ?? "",
  };
}

export class DomainService {
  // ── Professionals ─────────────────────────────────────────────────────────
  static async listProfessionals(): Promise<ProfessionalView[]> {
    const items = await ProfessionalModel.find().sort({ name: 1 }).exec();
    return items.map(professionalView);
  }

  static async createProfessional(
    data: Partial<Professional>,
  ): Promise<ProfessionalView> {
    const created = await ProfessionalModel.create({
      name: data.name,
      specialty: data.specialty ?? "",
      color: data.color ?? "#0fb8b0",
      active: data.active ?? true,
    });
    return professionalView(created);
  }

  // ── Patients ──────────────────────────────────────────────────────────────
  static async listPatients(): Promise<PatientView[]> {
    const items = await PatientModel.find().sort({ name: 1 }).exec();
    return items.map(patientView);
  }

  static async createPatient(data: Partial<Patient>): Promise<PatientView> {
    const created = await PatientModel.create({
      name: data.name,
      phone: data.phone ?? "",
      email: data.email ?? "",
      notes: data.notes ?? "",
    });
    return patientView(created);
  }

  // ── Appointments ──────────────────────────────────────────────────────────
  private static async professionalNameMap(): Promise<Map<string, string>> {
    const pros = await ProfessionalModel.find().exec();
    return new Map(pros.map((p) => [p._id.toString(), p.name]));
  }

  static async listAppointments(range?: {
    from?: string;
    to?: string;
  }): Promise<AppointmentView[]> {
    const query: Record<string, unknown> = {};
    if (range?.from || range?.to) {
      const start: Record<string, Date> = {};
      if (range.from) start.$gte = new Date(range.from);
      if (range.to) start.$lte = new Date(range.to);
      query.start = start;
    }
    const [items, nameMap] = await Promise.all([
      AppointmentModel.find(query).sort({ start: 1 }).exec(),
      this.professionalNameMap(),
    ]);
    return items.map((a) =>
      appointmentView(a, nameMap.get(a.professionalId) ?? "Sin asignar"),
    );
  }

  static async createAppointment(
    data: Partial<Appointment> & { start: string | Date },
  ): Promise<AppointmentView> {
    const created = await AppointmentModel.create({
      patientName: data.patientName,
      professionalId: data.professionalId,
      treatment: data.treatment ?? "",
      start: new Date(data.start),
      durationMinutes: data.durationMinutes ?? 30,
      status: data.status ?? "programada",
      notes: data.notes ?? "",
    });
    const nameMap = await this.professionalNameMap();
    return appointmentView(
      created,
      nameMap.get(created.professionalId) ?? "Sin asignar",
    );
  }

  static async updateAppointment(
    id: string,
    data: Partial<{
      start: string | Date;
      durationMinutes: number;
      status: string;
      professionalId: string;
      treatment: string;
      notes: string;
      patientName: string;
    }>,
  ): Promise<AppointmentView | null> {
    const update: Record<string, unknown> = {};
    if (data.start != null) update.start = new Date(data.start);
    if (data.durationMinutes != null) update.durationMinutes = data.durationMinutes;
    if (data.status != null) update.status = data.status;
    if (data.professionalId != null) update.professionalId = data.professionalId;
    if (data.treatment != null) update.treatment = data.treatment;
    if (data.notes != null) update.notes = data.notes;
    if (data.patientName != null) update.patientName = data.patientName;

    const updated = await AppointmentModel.findByIdAndUpdate(id, update, {
      new: true,
    }).exec();
    if (!updated) return null;
    const nameMap = await this.professionalNameMap();
    return appointmentView(
      updated,
      nameMap.get(updated.professionalId) ?? "Sin asignar",
    );
  }

  static async deleteAppointment(id: string): Promise<boolean> {
    const res = await AppointmentModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}
