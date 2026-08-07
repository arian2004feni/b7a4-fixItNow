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

const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await serviceOfServices.getAllService(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services Retrieve Successully",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const servicesController = {
  createService,
  getAllServices
};
