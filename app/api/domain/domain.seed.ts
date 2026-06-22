import bcrypt from "bcryptjs";
import { createLogger } from "~/lib/logger";
import { ProfessionalModel } from "./professional.model";
import { PatientModel } from "./patient.model";
import { AppointmentModel } from "./appointment.model";
import { UserModel } from "~/modules/authentication/authentication.model";
import { UserRole } from "~/modules/authentication/authentication.types";
import { ClinicRole } from "./domain.types";

const logger = createLogger("DomainSeed");

/** Seed demo clinic users with clinic roles stored in profile.clinicRole. */
async function seedClinicUsers(): Promise<void> {
  const demoUsers: Array<{
    username: string;
    email: string;
    password: string;
    role: UserRole;
    clinicRole: ClinicRole;
    displayName: string;
  }> = [
    {
      username: "marta",
      email: "marta@leireclinica.es",
      password: "Leire2026!",
      role: UserRole.Authenticated,
      clinicRole: ClinicRole.Dentista,
      displayName: "Dra. Marta Ruiz",
    },
    {
      username: "recepcion",
      email: "recepcion@leireclinica.es",
      password: "Leire2026!",
      role: UserRole.Authenticated,
      clinicRole: ClinicRole.Recepcionista,
      displayName: "Recepción",
    },
    {
      username: "director",
      email: "director@leireclinica.es",
      password: "Leire2026!",
      role: UserRole.Authenticated,
      clinicRole: ClinicRole.Director,
      displayName: "Dirección",
    },
  ];

  for (const u of demoUsers) {
    const existing = await UserModel.findOne({ email: u.email });
    if (existing) continue;
    const password_hash = await bcrypt.hash(u.password, 12);
    await UserModel.create({
      username: u.username,
      email: u.email,
      password_hash,
      role: u.role,
      is_active: true,
      email_verified: true,
      profile: { clinicRole: u.clinicRole, displayName: u.displayName },
    });
    logger.info(`Seeded demo user ${u.email} (${u.clinicRole})`);
  }

  // Tag the seeded admin with the Administrador clinic role if missing.
  const admin = await UserModel.findOne({ role: UserRole.Admin });
  if (admin && !admin.profile?.clinicRole) {
    admin.profile = {
      ...(admin.profile ?? {}),
      clinicRole: ClinicRole.Administrador,
      displayName: admin.profile?.displayName ?? "Administrador",
    };
    await admin.save();
    logger.info("Tagged admin user with Administrador clinic role");
  }
}

/** Build an ISO date for today at a given hour:minute, local-ish (server tz). */
function todayAt(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function seedClinicDomain(): Promise<void> {
  try {
    // Demo clinic users run independently of the professional/appointment seed.
    await seedClinicUsers();

    const existing = await ProfessionalModel.countDocuments();
    if (existing > 0) {
      return;
    }

    logger.info("Seeding clinic domain (professionals, patients, appointments)...");

    const professionals = await ProfessionalModel.create([
      { name: "Dra. Marta Ruiz", specialty: "Odontología general", color: "#0fb8b0", active: true },
      { name: "Dr. Javier Soler", specialty: "Endodoncia", color: "#5aa9e6", active: true },
      { name: "Dra. Elena Castro", specialty: "Estética facial", color: "#ff8a6b", active: true },
      { name: "Dr. Pablo Navarro", specialty: "Ortodoncia", color: "#9b8cff", active: true },
    ]);

    await PatientModel.create([
      { name: "Lucía Fernández", phone: "611 223 344", email: "lucia.f@example.com", notes: "Alergia a la penicilina." },
      { name: "Carlos Méndez", phone: "622 334 455", email: "carlos.m@example.com", notes: "" },
      { name: "Ana Gómez", phone: "633 445 566", email: "ana.g@example.com", notes: "Revisión semestral." },
      { name: "Diego Romero", phone: "644 556 677", email: "diego.r@example.com", notes: "" },
    ]);

    const proMap = professionals.reduce<Record<string, string>>((acc, p) => {
      acc[p.name] = p._id.toString();
      return acc;
    }, {});

    await AppointmentModel.create([
      {
        patientName: "Lucía Fernández",
        professionalId: proMap["Dra. Marta Ruiz"],
        treatment: "Revisión",
        start: todayAt(9, 0),
        durationMinutes: 30,
        status: "confirmada",
        notes: "",
      },
      {
        patientName: "Carlos Méndez",
        professionalId: proMap["Dr. Javier Soler"],
        treatment: "Endodoncia",
        start: todayAt(10, 0),
        durationMinutes: 60,
        status: "programada",
        notes: "Segunda sesión.",
      },
      {
        patientName: "Ana Gómez",
        professionalId: proMap["Dra. Elena Castro"],
        treatment: "Estética facial",
        start: todayAt(11, 30),
        durationMinutes: 60,
        status: "confirmada",
        notes: "",
      },
      {
        patientName: "Diego Romero",
        professionalId: proMap["Dra. Marta Ruiz"],
        treatment: "Limpieza dental",
        start: todayAt(12, 30),
        durationMinutes: 45,
        status: "programada",
        notes: "",
      },
      {
        patientName: "Carlos Méndez",
        professionalId: proMap["Dr. Pablo Navarro"],
        treatment: "Ortodoncia",
        start: todayAt(16, 0),
        durationMinutes: 30,
        status: "programada",
        notes: "Ajuste de brackets.",
      },
    ]);

    logger.info("✅ Clinic domain seeded successfully");
  } catch (error) {
    logger.error("❌ Failed to seed clinic domain:", error);
  }
}
