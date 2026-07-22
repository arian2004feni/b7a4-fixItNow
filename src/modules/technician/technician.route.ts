import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.put(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile,
);

router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianAvailabilitySlots,
);

export const technicianRouter = router;
