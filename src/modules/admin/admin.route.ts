import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/stats", auth(Role.ADMIN), adminController.getAdminStats);
router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.get("/users/:id", auth(Role.ADMIN), adminController.getUserById);
// router.patch("/users/:id", auth(Role.ADMIN), adminController.);
router.post("/categories", auth(Role.ADMIN), adminController.createCategory);
// router.patch("/categories", auth(Role.ADMIN), adminController.);
// router.delete("/categories", auth(Role.ADMIN), adminController.);
router.get("/categories", adminController.getAllCategories);
router.get("/bookings", auth(Role.ADMIN), adminController.getAllBookings);

export const adminRouter = router;
