import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

interface MyTokenPayload extends JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError("Server configuration error", 500);
    }

    let decoded: string | JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      throw new AppError("Invalid token", 401);
    }

    if (typeof decoded === "string" || !decoded.id) {
      throw new AppError("Invalid token", 401);
    }

    const payload = decoded as MyTokenPayload;

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      throw new AppError("User not found", 404)
    }
    req.user = user
    next();
  }
);