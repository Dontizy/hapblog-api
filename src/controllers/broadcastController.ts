import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";


export const broadcastNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const title = req.body.title?.trim();
    const message = req.body.message?.trim();

    if (!title || !message) {
      throw new AppError(
        "Title and message are required",
        400
      );
    }

    /*
     * The notification should appear to come from
     * Hapblog, not from the admin who created it.
     */
    const hapblogSystemUserId =
      process.env.HAPBLOG_SYSTEM_USER_ID;

    if (!hapblogSystemUserId) {
      throw new AppError(
        "Hapblog system user is not configured",
        500
      );
    }

    /*
     * Make sure the configured system user ID is valid.
     */
    if (
      !mongoose.Types.ObjectId.isValid(
        hapblogSystemUserId
      )
    ) {
      throw new AppError(
        "Invalid Hapblog system user ID",
        500
      );
    }

    /*
     * Make sure the Hapblog system user actually exists.
     */
    const hapblogUser = await User.findById(
      hapblogSystemUserId
    ).select("_id");

    if (!hapblogUser) {
      throw new AppError(
        "Hapblog system user not found",
        500
      );
    }

    /*
     * Get all users who should receive the announcement.
     */
    const users = await User.find()
      .select("_id")
      .lean();

    if (users.length === 0) {
      throw new AppError(
        "No users found",
        404
      );
    }


    const notifications = users.map((user) => ({
      recipient: user._id,

      sender: hapblogUser._id,

      type: "announcement" as const,
      announcementType: "general" as const,

      title,
      message,

      isRead: false,
    }));

    await Notification.insertMany(
      notifications
    );

    return res.status(201).json({
      success: true,
      message: "Notification sent to all users",
      recipientCount: notifications.length,
    });
  }
);
