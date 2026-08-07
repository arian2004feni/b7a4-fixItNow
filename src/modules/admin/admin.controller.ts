import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";
import httpStatus from "http-status-codes";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminServices.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved All Users",
      data: users,
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
    const bookings = await adminServices.getAllBookings();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfuly Retrieved all bookings",
      data: bookings,
    });
  },
);

export const adminController = {
  getAllUsers,
  getUserById,
  createCategory,
  getAllCategories,
  getAllBookings,
};
