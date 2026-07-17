import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await authService.signInUser(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const { accessToken, refreshToken } = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24hrs
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User login Successfully",
      data: { accessToken, refreshToken },
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    const veryfiedToken = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );

    if (typeof veryfiedToken === "string") {
      throw new Error("invalid token");
    }

    const profile = await authService.getMyProfileFromDB(veryfiedToken.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "user profile fetched successfully",
      data: { profile },
    });
  },
);

export const authController = {
  register,
  login,
  getMyProfile,
};
