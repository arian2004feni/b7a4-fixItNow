import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { bookingServices } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const booking = await bookingServices.createBookingDB(
      req.user?.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking successfully Created",
      data: booking,
    });
  },
);

const getUsersBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const data = await bookingServices.getAllUsersBookings(userId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All user's bookings Retrieve Successully",
      data,
    });
  },
);

const getUsersBookingsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const data = await bookingServices.getUsersBookingsById(userId as string, req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "user's bookings by id Retrieve Successully",
      data,
    });
  },
);

export const bookingController = {
  createBooking,
  getUsersBookings,
  getUsersBookingsById,
};
