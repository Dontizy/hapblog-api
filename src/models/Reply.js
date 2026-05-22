"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reply = exports.replySchema = void 0;
var mongoose_1 = require("mongoose");
exports.replySchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    comment: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Comment"
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }],
    body: {
        type: String,
        required: [true, "Comment body is required"],
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.replySchema.virtual("likesCount").get(function () {
    return this.likes.length;
});
exports.Reply = (0, mongoose_1.model)("Reply", exports.replySchema);
exports.default = exports.Reply;
