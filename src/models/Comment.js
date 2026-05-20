"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = exports.commentSchema = void 0;
var mongoose_1 = require("mongoose");
exports.commentSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },
    body: {
        type: String,
        required: [true, "Comment body can't be empty"],
        trim: true
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    blog: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Blog",
        index: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.commentSchema.virtual("likedCommentCount").get(function () {
    return this.likes.length;
});
exports.Comment = (0, mongoose_1.model)("Comment", exports.commentSchema);
exports.default = exports.Comment;
