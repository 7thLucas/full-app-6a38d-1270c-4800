// Import global routes
import { Router } from "express";
import routes from "./routes";
import domainRoutes from "./domain/domain.routes";
import { initializeModels } from "./models";

// Initialize module models (scans app/modules/*)
await initializeModels();

// Initialize domain models (registers Typegoose models by importing them).
import "./domain/professional.model";
import "./domain/patient.model";
import "./domain/appointment.model";

// Compose module-discovered routes with explicit domain routes.
const router = Router();
router.use(routes);
router.use(domainRoutes);

export default router;
