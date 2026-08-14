import { Schema, model, Types, HydratedDocument } from "mongoose";

export interface INotification {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;

  type:
    | "blog_like"
    | "comment"
    | "reply"
    | "reply_like"
    | "comment_like"
    | "follow"
    | "welcome"
    | "announcement";

  announcementType?: "general" | "suspension";

  blog?: Types.ObjectId;
  comment?: Types.ObjectId;
  reply?: Types.ObjectId;

  suspendedUntil?: Date;

  isRead: boolean;
  title?: string;
  message?: string;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    type: {
      type: String,
      enum: [
        "blog_like",
        "comment",
        "reply",
        "reply_like",
        "comment_like",
        "follow",
        "announcement",
        "welcome"
      ],
      required: true,
    },
    announcementType: {
      type: String,
      enum: ["general", "suspension"],
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
    title: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },

    suspendedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema,
);

export default Notification;
