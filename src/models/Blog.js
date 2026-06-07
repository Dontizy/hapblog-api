"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var blogSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Enter title for the blog post"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Content can't be empty!"]
    },
    imageUrl: {
        type: String,
        required: false,
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
blogSchema.virtual("commentsCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "blog",
    count: true,
});
blogSchema.virtual("likesCount").get(function () {
    return this.likes.length;
});
var Blog = (0, mongoose_1.model)("Blog", blogSchema);
exports.default = Blog;
