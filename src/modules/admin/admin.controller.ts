import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";
import httpStatus from "http-status-codes";

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await adminServices.getAdminStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Admin statistics retrieved successfully",
    data: stats,
  });
});

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminServices.getAllUsers(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved All Users",
      data: users.data,
      meta: users.meta,
    });
  },
);

const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminServices.getUserById(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved All Users",
      data: users,
    });
  },
);

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const category = await adminServices.createCategoryInToDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Created Category",
      data: { category },
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await adminServices.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved Category",
      data: category,
    });
  },
);

const getAllBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookings = await adminServices.getAllBookings(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved all bookings",
      data: bookings.data,
      meta: bookings.meta,
    });
  },
);

export const adminController = {
  getAdminStats,
  getAllUsers,
  getUserById,
  createCategory,
  getAllCategories,
  getAllBookings,
};
