"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeComment = exports.deleteComment = exports.updateComment = exports.fetchComments = exports.createComment = void 0;
var mongoose_1 = require("mongoose");
var asyncHandler_js_1 = require("../utils/asyncHandler.js");
var AppError_js_1 = require("../utils/AppError.js");
var Blog_js_1 = require("../models/Blog.js");
var Comment_js_1 = require("../models/Comment.js");
exports.createComment = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, id, user, userId, blog, comment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = req.body.body;
                id = req.params.id;
                user = req.user;
                userId = user._id;
                if (!(body === null || body === void 0 ? void 0 : body.trim())) {
                    throw new AppError_js_1.AppError("Comment body can't be empty", 400);
                }
                if (!mongoose_1.default.isValidObjectId(userId)) {
                    throw new AppError_js_1.AppError("Invalid user ID", 400);
                }
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog ID", 400);
                }
                if (!user) {
                    throw new AppError_js_1.AppError("Unauthorized", 401);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _a.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Blog post not found", 404);
                }
                return [4 /*yield*/, Comment_js_1.default.create({
                        author: userId,
                        blog: blog._id,
                        body: body.trim()
                    })];
            case 2:
                comment = _a.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Comment created successfully",
                        comment: comment
                    })];
        }
    });
}); });
exports.fetchComments = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, page, limit, skip, blog, _a, comments, totalComments;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                page = Number(req.query.page) || 1;
                limit = Number(req.query.limit) || 10;
                skip = (page - 1) * limit;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog post ID", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _b.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Blog post not found", 404);
                }
                return [4 /*yield*/, Promise.all([Comment_js_1.default.find({ blog: id }).sort({ createdAt: -1 }).populate("author", "name avatar").skip(skip).limit(limit),
                        Comment_js_1.default.countDocuments({ blog: id })
                    ])];
            case 2:
                _a = _b.sent(), comments = _a[0], totalComments = _a[1];
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        comments: comments,
                        totalComments: totalComments,
                        currentPage: page,
                        totalPages: Math.ceil(totalComments / limit)
                    })];
        }
    });
}); });
exports.updateComment = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, commentId, body, blog, comment;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, id = _a.id, commentId = _a.commentId;
                body = req.body.body;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog post ID", 400);
                }
                if (!mongoose_1.default.isValidObjectId(commentId)) {
                    throw new AppError_js_1.AppError("Invalid comment ID", 400);
                }
                if (!(body === null || body === void 0 ? void 0 : body.trim())) {
                    throw new AppError_js_1.AppError("Comment body can't be empty", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _b.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Blog post not found", 404);
                }
                return [4 /*yield*/, Comment_js_1.default.findOne({ _id: commentId, blog: id })];
            case 2:
                comment = _b.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Comment not found", 404);
                }
                comment.body = body.trim();
                return [4 /*yield*/, comment.save()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        comment: comment,
                        message: "Comment updated successfully"
                    })];
        }
    });
}); });
exports.deleteComment = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, commentId, id, blog, comment;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, commentId = _a.commentId, id = _a.id;
                if (!mongoose_1.default.isValidObjectId(commentId)) {
                    throw new AppError_js_1.AppError("Invalid comment ID", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _b.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Blog post not found", 404);
                }
                return [4 /*yield*/, Comment_js_1.default.findOne({ _id: commentId, blog: id
                    })];
            case 2:
                comment = _b.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Comment not found", 404);
                }
                return [4 /*yield*/, comment.deleteOne()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Comment deleted successfully"
                    })];
        }
    });
}); });
exports.toggleLikeComment = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, commentId, user, userId, comment, alreadyLiked;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, id = _a.id, commentId = _a.commentId;
                user = req.user;
                if (!user) {
                    throw new AppError_js_1.AppError("Not authorized", 401);
                }
                userId = user._id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog post ID", 400);
                }
                if (!mongoose_1.default.isValidObjectId(commentId)) {
                    throw new AppError_js_1.AppError("Invalid blog comment ID", 400);
                }
                return [4 /*yield*/, Comment_js_1.default.findOne({
                        _id: commentId,
                        blog: id
                    })];
            case 1:
                comment = _b.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Blog post comment not found", 404);
                }
                alreadyLiked = comment.likes.some(function (like) { return like.toString() === userId.toString(); });
                if (!alreadyLiked) return [3 /*break*/, 3];
                comment.likes = comment.likes.filter(function (like) { return like.toString() !== userId.toString(); });
                return [4 /*yield*/, comment.save()];
            case 2:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Unliked comment"
                    })];
            case 3:
                comment.likes.push(userId);
                return [4 /*yield*/, comment.save()];
            case 4:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "liked comment"
                    })];
        }
    });
}); });
