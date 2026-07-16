import { Request, Response } from "express";
import { registerUserInToDb } from "./auth.service";
import httpStatus from "http-status-codes";

const register = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const user = await registerUserInToDb(payload);

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "failed to register user",
      error: (error as Error).message,
    });
  }
};

export const authController = {
  register,
};
