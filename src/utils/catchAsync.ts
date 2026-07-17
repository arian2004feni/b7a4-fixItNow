import { NextFunction, Request, RequestHandler, Response } from "express";
import statusCode from "http-status-codes";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: statusCode.INTERNAL_SERVER_ERROR,
        message: "failed to register user",
        error: (error as Error).message,
      });
    }
  };
};
