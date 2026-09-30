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

router.post(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.createAvailabilitySlots,
);

router.patch(
  "/availability/:id",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianAvailabilitySlots,
);

router.get(
  "/bookings",
  auth(Role.TECHNICIAN),
  technicianController.getTechnicianBookings,
);

router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianController.updateBookingStatus,
);

router.patch(
  "/start/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianController.startTheJob,
);

router.patch(
  "/complete/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianController.completeBookingStatus,
);

router.get("/", technicianController.getAllTechnicians);

router.get("/:id", technicianController.getSingleTechnician);

export const technicianRouter = router;
