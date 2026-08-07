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



router.get(
  "/",
  technicianController.getAllTechnicians,
)

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

export const technicianRouter = router;
