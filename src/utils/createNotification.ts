import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { Types } from "mongoose";

interface CreateNotificationParams {
  recipient: string | Types.ObjectId;
  sender?: string | Types.ObjectId;

  type:
    | "blog_like"
    | "comment"
    | "reply"
    | "reply_like"
    | "comment_like"
    | "follow"
    | "welcome"
    | "announcement";

  blog?: string;
  comment?: string;
  reply?: string;
  title?: string;
  message?: string;
  suspendedUntil?: Date;
  announcementType?: "general" | "suspension";
}

export const createNotification = async ({
  recipient,
  sender,
  type,
  blog,
  comment,
  reply,
  title,
  message,
  suspendedUntil,
  announcementType,
}: CreateNotificationParams) => {
  /*
   * If an explicit sender was provided, use it.
   *
   * Otherwise, try to use the Hapblog system user.
   *
   * If the system user isn't configured or doesn't exist,
   * the notification will simply have no sender.
   */
  let resolvedSender = sender;

  if (!resolvedSender) {
    const hapblogSystemUserId = process.env.HAPBLOG_SYSTEM_USER_ID;

    if (hapblogSystemUserId && Types.ObjectId.isValid(hapblogSystemUserId)) {
      const hapblogUser =
        await User.findById(hapblogSystemUserId).select("_id");

      if (hapblogUser) {
        resolvedSender = hapblogUser._id;
      }
    }
  }

  /*
   * Don't notify a user about their own action.
   *
   * Only perform this check when there is actually a sender.
   */
  if (resolvedSender && recipient.toString() === resolvedSender.toString()) {
    return;
  }

  const query: Record<string, unknown> = {
    recipient,
    type,
  };

  /*
   * Only add sender when one exists.
   */
  if (resolvedSender) {
    query.sender = resolvedSender;
  }

  if (blog) query.blog = blog;
  if (comment) query.comment = comment;
  if (reply) query.reply = reply;

  const existingNotification = await Notification.findOne(query);

  if (existingNotification) {
    return;
  }

  const notification = {
    ...query,
    ...(title !== undefined && { title }),
    ...(message !== undefined && { message }),
    ...(suspendedUntil !== undefined && {
      suspendedUntil,
    }),
    ...(announcementType !== undefined && {
      announcementType,
    }),
  };

  return Notification.create(notification);
};
