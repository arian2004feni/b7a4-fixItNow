import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.get("/users/:id", auth(Role.ADMIN), adminController.getUserById);
router.post("/categories", auth(Role.ADMIN), adminController.createCategory);
router.get("/categories", adminController.getAllCategories);
router.get("/bookings", auth(Role.ADMIN), adminController.getAllBookings);

export const adminRouter = router;
