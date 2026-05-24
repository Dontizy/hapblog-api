import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  const statusCode = err.statusCode || 500;

  // Log only server errors
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;