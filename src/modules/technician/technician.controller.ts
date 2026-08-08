import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianServices } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const updateTechnicianProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const technicianProfile =
      await technicianServices.updateTechnicianProfileDB(
        req.user?.id as string,
        payload,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician Updated Successfully",
      data: { ...technicianProfile },
    });
  },
);

const updateTechnicianAvailabilitySlots = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const availabilitySlots =
      await technicianServices.updateTechnicianAvailabilitySlotsDB(
        req.user?.id as string,
        req.body,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability Slots successfully Updated",
      data: availabilitySlots,
    });
  },
);

const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await technicianServices.getAllTechnicians(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile Retrieve Successully",
      data: result.data,
      meta: result.meta,
    });
  },
);

const getSingleTechnician = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await technicianServices.getSingleTechnician(
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile Retrieve Successully",
      data,
    });
  },
);

const getTechnicianBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const data = await technicianServices.getTechnicianBookings(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "successfully retreived bookings",
      data,
    });
  },
);

const updateBookingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookingId = req.params.id;
    const userId = req.user?.id;

    const result = await technicianServices.updateBookingStatus(
      bookingId as string,
      userId as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Booking ${req.body.status.toLowerCase()} successfully`,
      data: result,
    });
  },
);

const completeBookingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookingId = req.params.id;
    const userId = req.user?.id;

    const result = await technicianServices.completeBookingStatus(
      bookingId as string,
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Booking ${req.body.status.toLowerCase()} successfully`,
      data: result,
    });
  },
);

export const technicianController = {
  updateTechnicianProfile,
  updateTechnicianAvailabilitySlots,
  getAllTechnicians,
  getSingleTechnician,
  getTechnicianBookings,
  updateBookingStatus,
  completeBookingStatus
};
