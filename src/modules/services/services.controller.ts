import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { serviceOfServices } from "./services.service";

const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const service = await serviceOfServices.createServiceInToDB(
      req.body,
      req.user?.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Service Created Successfully!",
      data: service,
    });
  },
);

export const servicesController = {
  createService,
};
