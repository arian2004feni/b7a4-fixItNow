import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const reviewRouter = Router();

reviewRouter.post("/", auth(Role.CUSTOMER), reviewController.createReview);

export default reviewRouter;
