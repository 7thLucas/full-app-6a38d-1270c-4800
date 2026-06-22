import { Router } from "express";
import type { Request, Response } from "express";
import { DomainService } from "./domain.service";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

// All domain routes require an authenticated clinic user.
router.use("/clinic", requireAuth);

// ── Professionals ─────────────────────────────────────────────────────────────
router.get("/clinic/professionals", async (_req: Request, res: Response) => {
  try {
    const data = await DomainService.listProfessionals();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

router.post("/clinic/professionals", async (req: Request, res: Response) => {
  try {
    const data = await DomainService.createProfessional(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

// ── Patients ──────────────────────────────────────────────────────────────────
router.get("/clinic/patients", async (_req: Request, res: Response) => {
  try {
    const data = await DomainService.listPatients();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

router.post("/clinic/patients", async (req: Request, res: Response) => {
  try {
    const data = await DomainService.createPatient(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

// ── Appointments ──────────────────────────────────────────────────────────────
router.get("/clinic/appointments", async (req: Request, res: Response) => {
  try {
    const data = await DomainService.listAppointments({
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

router.post("/clinic/appointments", async (req: Request, res: Response) => {
  try {
    const data = await DomainService.createAppointment(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

router.patch("/clinic/appointments/:id", async (req: Request, res: Response) => {
  try {
    const data = await DomainService.updateAppointment(String(req.params.id), req.body);
    if (!data) {
      res.status(404).json({ success: false, message: "Cita no encontrada" });
      return;
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

router.delete("/clinic/appointments/:id", async (req: Request, res: Response) => {
  try {
    const ok = await DomainService.deleteAppointment(String(req.params.id));
    res.json({ success: ok });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e?.message ?? "Error" });
  }
});

export default router;
