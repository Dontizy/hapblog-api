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
        required: [true, "Comment body can't be empty"]
    },
    blog: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Blog"
    }
}, {
    timestamps: true
});
exports.Comment = (0, mongoose_1.model)("Comment", exports.commentSchema);
exports.default = exports.Comment;
