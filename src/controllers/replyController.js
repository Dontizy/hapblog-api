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
exports.toggleReplyLike = exports.deleteReply = exports.updateReply = exports.createReply = void 0;
var Reply_js_1 = require("../models/Reply.js");
var Comment_js_1 = require("../models/Comment.js");
var AppError_js_1 = require("../utils/AppError.js");
var asyncHandler_js_1 = require("../utils/asyncHandler.js");
var mongoose_1 = require("mongoose");
exports.createReply = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var commentId, comment, body, user, userId, reply;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commentId = req.params.commentId;
                if (!mongoose_1.default.isValidObjectId(commentId)) {
                    throw new AppError_js_1.AppError("Invalid comment ID", 400);
                }
                return [4 /*yield*/, Comment_js_1.default.findById(commentId)];
            case 1:
                comment = _a.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Comment not found!", 404);
                }
                body = req.body.body;
                if (!(body === null || body === void 0 ? void 0 : body.trim())) {
                    throw new AppError_js_1.AppError("Reply is required", 400);
                }
                user = req.user;
                if (!user) {
                    throw new AppError_js_1.AppError("Not authorized", 401);
                }
                userId = user._id;
                return [4 /*yield*/, Reply_js_1.default.create({ author: userId, comment: comment._id, body: body.trim() })];
            case 2:
                reply = _a.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: "Reply sent successfully",
                        reply: reply
                    })];
        }
    });
}); });
exports.updateReply = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, replyId, body, comment, reply;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, id = _a.id, replyId = _a.replyId;
                body = req.body.body;
                if (!mongoose_1.default.isValidObjectId(id) || !mongoose_1.default.isValidObjectId(replyId)) {
                    throw new AppError_js_1.AppError("Invalid comment or reply id", 400);
                }
                if (!(body === null || body === void 0 ? void 0 : body.trim())) {
                    throw new AppError_js_1.AppError("Reply body is required", 400);
                }
                return [4 /*yield*/, Comment_js_1.default.exists({ _id: id })];
            case 1:
                comment = _b.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Comment not found", 404);
                }
                return [4 /*yield*/, Reply_js_1.default.findOne({ _id: replyId, comment: id })];
            case 2:
                reply = _b.sent();
                if (!reply) {
                    throw new AppError_js_1.AppError("Reply not found", 404);
                }
                reply.body = body.trim();
                return [4 /*yield*/, reply.save()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Reply updated successfully",
                        reply: reply
                    })];
        }
    });
}); });
exports.deleteReply = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, replyId, comment, reply;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, id = _a.id, replyId = _a.replyId;
                if (!mongoose_1.default.isValidObjectId(id) ||
                    !mongoose_1.default.isValidObjectId(replyId)) {
                    throw new AppError_js_1.AppError("Invalid comment or reply ID", 400);
                }
                return [4 /*yield*/, Comment_js_1.default.exists({ _id: id })];
            case 1:
                comment = _b.sent();
                if (!comment) {
                    throw new AppError_js_1.AppError("Comment not found", 404);
                }
                return [4 /*yield*/, Reply_js_1.default.findOne({
                        _id: replyId,
                        comment: id,
                    })];
            case 2:
                reply = _b.sent();
                if (!reply) {
                    throw new AppError_js_1.AppError("Reply not found", 404);
                }
                return [4 /*yield*/, reply.deleteOne()];
            case 3:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "Reply deleted successfully",
                    })];
        }
    });
}); });
exports.toggleReplyLike = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, replyId, userId, reply, hasLiked;
    var _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = req.params, id = _a.id, replyId = _a.replyId;
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
                if (!mongoose_1.default.isValidObjectId(id) ||
                    !mongoose_1.default.isValidObjectId(replyId)) {
                    throw new AppError_js_1.AppError("Invalid comment or reply ID", 400);
                }
                return [4 /*yield*/, Reply_js_1.default.findOne({
                        _id: replyId,
                        comment: id,
                    })];
            case 1:
                reply = _d.sent();
                if (!reply) {
                    throw new AppError_js_1.AppError("Reply not found", 404);
                }
                hasLiked = reply.likes.some(function (like) { return like.toString() === (userId === null || userId === void 0 ? void 0 : userId.toString()); });
                return [4 /*yield*/, Reply_js_1.default.findByIdAndUpdate(replyId, (_b = {},
                        _b[hasLiked ? "$pull" : "$addToSet"] = {
                            likes: userId,
                        },
                        _b))];
            case 2:
                _d.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        liked: !hasLiked,
                        message: hasLiked
                            ? "Reply unliked successfully"
                            : "Reply liked successfully",
                    })];
        }
    });
}); });
