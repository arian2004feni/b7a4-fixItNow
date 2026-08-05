import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const data = await reviewService.createReview(userId as string, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review created Successfully",
      data,
    });
  },
);

export const reviewController = {
  createReview,
};
