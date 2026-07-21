import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { servicesController } from "./services.controller";

const router = Router();

router.post("/", auth(Role.TECHNICIAN), servicesController.createService);

export const serviceRouter = router;
