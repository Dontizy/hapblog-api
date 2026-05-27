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
exports.toggleLikePost = exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPost = exports.getAllBlogPost = exports.createBlogPost = void 0;
var Blog_js_1 = require("../models/Blog.js");
var asyncHandler_js_1 = require("../utils/asyncHandler.js");
var AppError_js_1 = require("../utils/AppError.js");
var mongoose_1 = require("mongoose");
var uploadToCloudinary_js_1 = require("../utils/uploadToCloudinary.js");
var Comment_js_1 = require("../models/Comment.js");
var Reply_js_1 = require("../models/Reply.js");
exports.createBlogPost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, title, content, user, userId, blogData, upload, blog;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, title = _a.title, content = _a.content;
                if (!title || !content) {
                    throw new AppError_js_1.AppError("Title and Content can't be empty!", 400);
                }
                user = req.user;
                if (!user) {
                    throw new AppError_js_1.AppError("Not authorized", 401);
                }
                userId = user._id;
                blogData = { title: title, content: content, author: userId };
                if (!req.file) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, uploadToCloudinary_js_1.default)(req.file)];
            case 1:
                upload = _b.sent();
                blogData.imageUrl = upload.secure_url;
                _b.label = 2;
            case 2: return [4 /*yield*/, Blog_js_1.default.create(blogData)];
            case 3:
                blog = _b.sent();
                res.status(201).json({
                    success: true,
                    blog: blog
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getAllBlogPost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, skip, _a, blogs, totalBlogs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = Number(req.query.page) || 1;
                limit = Number(req.query.limit) || 10;
                skip = (page - 1) * limit;
                return [4 /*yield*/, Promise.all([Blog_js_1.default.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("author", "name email").populate("commentsCount"),
                        Blog_js_1.default.countDocuments()
                    ])];
            case 1:
                _a = _b.sent(), blogs = _a[0], totalBlogs = _a[1];
                res.status(200).json({
                    success: true,
                    blogs: blogs,
                    currentPage: page,
                    totalPages: Math.ceil(totalBlogs / limit),
                    totalBlogs: totalBlogs
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getBlogPost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, blog, commentCount;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog id", 400);
                }
                return [4 /*yield*/, Promise.all([Blog_js_1.default.findById(id).populate("author", "name email"),
                        Comment_js_1.default.countDocuments({ blog: id })
                    ])];
            case 1:
                _a = _b.sent(), blog = _a[0], commentCount = _a[1];
                if (!blog) {
                    throw new AppError_js_1.AppError("Post does not exist", 404);
                }
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        blog: blog,
                        commentCount: commentCount
                    })];
        }
    });
}); });
exports.updateBlogPost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, title, content, blog, upload;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, title = _a.title, content = _a.content;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog id", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _b.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError('Post not found', 404);
                }
                if (typeof title === "string") {
                    blog.title = title;
                }
                if (typeof content === "string") {
                    blog.content = content;
                }
                if (!req.file) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, uploadToCloudinary_js_1.default)(req.file)];
            case 2:
                upload = _b.sent();
                blog.imageUrl = upload.secure_url;
                _b.label = 3;
            case 3: return [4 /*yield*/, blog.save()];
            case 4:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        blog: blog
                    })];
        }
    });
}); });
exports.deleteBlogPost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, blog, comments, commentIds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog id", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _a.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Post not found", 404);
                }
                return [4 /*yield*/, Comment_js_1.default.find({ blog: blog._id }).select("_id").lean()];
            case 2:
                comments = _a.sent();
                commentIds = comments.map(function (comment) { return comment._id; });
                if (!(commentIds.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, Reply_js_1.default.deleteMany({
                        comment: { $in: commentIds }
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, Comment_js_1.default.deleteMany({ blog: blog._id })];
            case 5:
                _a.sent();
                return [4 /*yield*/, Blog_js_1.default.findByIdAndDelete(id)];
            case 6:
                _a.sent();
                return [2 /*return*/, res.status(200).json({ success: true, message: "Blog post deleted successfully" })];
        }
    });
}); });
exports.toggleLikePost = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, userId, blog, alreadyLiked;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                user = req.user;
                if (!user) {
                    throw new AppError_js_1.AppError("Not authorized ", 401);
                }
                userId = user._id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid blog post ID", 400);
                }
                return [4 /*yield*/, Blog_js_1.default.findById(id)];
            case 1:
                blog = _a.sent();
                if (!blog) {
                    throw new AppError_js_1.AppError("Blog post not found", 404);
                }
                alreadyLiked = blog.likes.some(function (like) { return like.toString() === userId.toString(); });
                if (!alreadyLiked) return [3 /*break*/, 3];
                blog.likes = blog.likes.filter(function (like) { return like.toString() !== userId.toString(); });
                return [4 /*yield*/, blog.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Unliked blog post"
                    })];
            case 3:
                blog.likes.push(userId);
                return [4 /*yield*/, blog.save()];
            case 4:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "liked blog post"
                    })];
        }
    });
}); });
