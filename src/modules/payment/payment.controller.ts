import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const data = await paymentService.createPayment(userId as string, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment created successfully",
      data,
    });
  },
);

const webhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"];

    await paymentService.handleWebhook(event, signature as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "webhook triggered successfully",
    });
  },
);

const getUsersPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const data = await paymentService.getAllUsersPayments(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "user payments retreived successfully",
      data,
    });
  },
);

const getPaymentDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await paymentService.getPaymentDetails(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "user payments retreived successfully",
      data,
    });
  },
);

export const paymentController = {
  createPayment,
  webhook,
  getUsersPayments,
  getPaymentDetails
};
