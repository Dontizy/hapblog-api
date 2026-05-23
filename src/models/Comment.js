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
            default: []
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
exports.commentSchema.virtual("repliesCount", {
    ref: "Reply",
    localField: "_id",
    foreignField: "comment",
    count: true,
});
exports.commentSchema.virtual("replies", {
    ref: "Reply",
    localField: "_id",
    foreignField: "comment",
});
exports.commentSchema.virtual("likedCommentCount").get(function () {
    var _a;
    return ((_a = this.likes) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
exports.Comment = (0, mongoose_1.model)("Comment", exports.commentSchema);
exports.default = exports.Comment;
