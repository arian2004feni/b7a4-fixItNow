import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);

router.get(
  "/",
  auth(Role.CUSTOMER),
  bookingController.getUsersBookings,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  bookingController.getUsersBookingsById,
);

export const bookingRouter = router;
