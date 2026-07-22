import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianServices } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const technicianProfile =
      await technicianServices.updateTechnicianProfileDB(req.user?.id as string, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician Updated Successfully",
      data: { ...technicianProfile },
    });
  },
);

export const technicianController = {
  updateTechnicianProfile,
};
