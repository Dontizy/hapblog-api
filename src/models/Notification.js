"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
var mongoose_1 = require("mongoose");
var notificationSchema = new mongoose_1.Schema({
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
    },
    reply: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Reply"
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)("Notification", notificationSchema);
exports.default = exports.Notification;
