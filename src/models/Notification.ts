import {
  Schema,
  model,
  Types,
  HydratedDocument,
} from "mongoose";

export interface INotification {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;

  type: "blog_like" | "comment" | "reply" | "reply_like" | "comment_like";

  blog: Types.ObjectId;

  comment?: Types.ObjectId;
  reply?: Types.ObjectId;

  isRead: boolean;
}

export type NotificationDocument =
  HydratedDocument<INotification>;

const notificationSchema =
  new Schema<INotification>(
    {
      recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      type: {
        type: String,
        enum: [
        "blog_like",
        "comment", 
        "reply",
        "reply_like",
        "comment_like"
        ],
        required: true,
      },

      blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
      },

      comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
      reply:{
        type:Schema.Types.ObjectId,
        ref:"Reply"
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export const Notification =
  model<INotification>(
    "Notification",
    notificationSchema
  );

export default Notification;