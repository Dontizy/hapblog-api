import Notification from "../models/Notification.js";
import { Types } from "mongoose";

interface CreateNotificationParams {
  recipient: string | Types.ObjectId;
  sender: string | Types.ObjectId;
  type:
    | "blog_like"
    | "comment"
    | "reply"
    | "reply_like"
    | "comment_like"
    | "follow";
  blog?: string;
  comment?: string;
  reply?: string;
}

export const createNotification = async ({
  recipient,
  sender,
  type,
  blog,
  comment,
  reply,
}: CreateNotificationParams) => {
  if (recipient.toString() === sender.toString()) {
    return;
  }

  const query: any = {
    recipient,
    sender,
    type,
    blog,
  };

  if (blog) query.blog = blog;
  if (comment) query.comment = comment;
  if (reply) query.reply = reply;

  const existingNotification = await Notification.findOne(query);

  if (existingNotification) {
    return;
  }

  return Notification.create(query);
};
