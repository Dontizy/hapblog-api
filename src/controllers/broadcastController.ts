import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const broadcastNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const title = req.body.title?.trim();
    const message = req.body.message?.trim();

    if (!title || !message) {
      throw new AppError("Title and message are required", 400);
    }

    const users = await User.find().select("_id");

    if (users.length === 0) {
      throw new AppError("No users found", 404);
    }

    const notifications = users.map((user) => ({
      recipient: user._id,
      sender: req.user!._id,
      type: "announcement" as const,
      announcementType: "general" as const,
      title,
      message,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: "Notification sent to all users",
      recipientCount: notifications.length,
    });
  },
);
