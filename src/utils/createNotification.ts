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
    | "follow"
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
  if (recipient.toString() === sender.toString()) {
    return;
  }

  const query: Record<string, unknown> = {
    recipient,
    type,
  };

  if (sender) query.sender = sender;
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
    ...(suspendedUntil !== undefined && { suspendedUntil }),
    ...(announcementType !== undefined && { announcementType }),
  };

  return Notification.create(notification);
};

// export const createNotification = async ({
//   recipient,
//   sender,
//   type,
//   blog,
//   comment,
//   reply,
// }: CreateNotificationParams) => {
//   if (recipient.toString() === sender.toString()) {
//     return;
//   }

//   const query: any = {
//     recipient,
//     sender,
//     type,
//     blog,
//   };

//   if (blog) query.blog = blog;
//   if (comment) query.comment = comment;
//   if (reply) query.reply = reply;

//   const existingNotification = await Notification.findOne(query);

//   if (existingNotification) {
//     return;
//   }

//   return Notification.create(query);
// };
