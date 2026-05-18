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
exports.userProfile = exports.addOrRemoveAdmin = exports.changePassword = exports.deleteUser = exports.allUsers = exports.login = exports.register = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var bcryptjs_1 = require("bcryptjs");
var User_js_1 = require("../models/User.js");
var asyncHandler_js_1 = require("../utils/asyncHandler.js");
var AppError_js_1 = require("../utils/AppError.js");
var mongoose_1 = require("mongoose");
var Blog_js_1 = require("../models/Blog.js");
var hashPassword = function (plainPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var salt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 1:
                salt = _a.sent();
                return [2 /*return*/, bcryptjs_1.default.hash(plainPassword, salt)];
        }
    });
}); };
//Register controller
exports.register = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, password, normalizedEmail, emailRegex, userExist, user, _b, _c, secret, token;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, password = _a.password;
                if (!name || !email || !password)
                    throw new AppError_js_1.AppError("All fields are required", 400);
                normalizedEmail = email.trim().toLowerCase();
                emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (!emailRegex.test(normalizedEmail))
                    throw new AppError_js_1.AppError("Please add a valid email", 400);
                return [4 /*yield*/, User_js_1.User.findOne({ email: normalizedEmail })];
            case 1:
                userExist = _e.sent();
                if (userExist)
                    throw new AppError_js_1.AppError("User already exists, login", 409);
                _c = (_b = User_js_1.User).create;
                _d = {
                    name: name.trim(),
                    email: normalizedEmail
                };
                return [4 /*yield*/, hashPassword(password)];
            case 2: return [4 /*yield*/, _c.apply(_b, [(_d.password = _e.sent(),
                        _d)])];
            case 3:
                user = _e.sent();
                secret = process.env.JWT_SECRET;
                if (!secret)
                    throw new AppError_js_1.AppError("Server configuration error", 500);
                token = jsonwebtoken_1.default.sign({ id: String(user._id) }, secret, { expiresIn: '1d' });
                return [2 /*return*/, res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, }, token: token })];
        }
    });
}); });
//login controller
exports.login = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, emailLowercase, user, checkPassword, secret, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    throw new AppError_js_1.AppError("Invalid credentials: email and password are required", 400);
                }
                emailLowercase = email.trim().toLowerCase();
                return [4 /*yield*/, User_js_1.User.findOne({ email: emailLowercase }).select("+password")];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw new AppError_js_1.AppError("Invalid credentials", 401);
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
            case 2:
                checkPassword = _b.sent();
                if (!checkPassword) {
                    throw new AppError_js_1.AppError("Invalid credentials", 401);
                }
                secret = process.env.JWT_SECRET;
                if (!secret) {
                    throw new AppError_js_1.AppError("Server configuration error", 500);
                }
                token = jsonwebtoken_1.default.sign({ id: String(user._id) }, secret, { expiresIn: '1d' });
                return [2 /*return*/, res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token: token })];
        }
    });
}); });
exports.allUsers = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, User_js_1.User.find().sort({ createdAt: -1 })];
            case 1:
                users = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        users: users
                    })];
        }
    });
}); });
exports.deleteUser = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError('Invalid user id', 400);
                }
                return [4 /*yield*/, User_js_1.User.findById(id)];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new AppError_js_1.AppError("User not found", 404);
                }
                return [4 /*yield*/, Blog_js_1.default.deleteMany({ author: user._id })];
            case 2:
                _a.sent();
                return [4 /*yield*/, User_js_1.User.findByIdAndDelete(id)];
            case 3:
                _a.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        message: "User and associated blogs deleted successfully",
                    })];
        }
    });
}); });
exports.changePassword = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, newPassword, oldPassword, user, isMatch, samePassword, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                id = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
                _a = req.body, newPassword = _a.newPassword, oldPassword = _a.oldPassword;
                if (!id) {
                    throw new AppError_js_1.AppError("Not authorized", 401);
                }
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid user id", 400);
                }
                return [4 /*yield*/, User_js_1.User.findById(id).select("+password")];
            case 1:
                user = _d.sent();
                if (!user) {
                    throw new AppError_js_1.AppError("User does not exist", 404);
                }
                if (!oldPassword || !newPassword) {
                    throw new AppError_js_1.AppError("All fields are required", 400);
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(oldPassword, user.password)];
            case 2:
                isMatch = _d.sent();
                if (!isMatch) {
                    throw new AppError_js_1.AppError('Incorrect old password!', 403);
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(newPassword, user.password)];
            case 3:
                samePassword = _d.sent();
                if (samePassword) {
                    throw new AppError_js_1.AppError("New password must be different", 400);
                }
                _b = user;
                return [4 /*yield*/, hashPassword(newPassword)];
            case 4:
                _b.password = _d.sent();
                return [4 /*yield*/, user.save()];
            case 5:
                _d.sent();
                res.status(200).json({ success: true, message: 'Password updated' });
                return [2 /*return*/];
        }
    });
}); });
exports.addOrRemoveAdmin = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                if (!mongoose_1.default.isValidObjectId(id)) {
                    throw new AppError_js_1.AppError("Invalid user ID", 400);
                }
                return [4 /*yield*/, User_js_1.User.findById(id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw new AppError_js_1.AppError("User not found", 404);
                }
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) === id) {
                    throw new AppError_js_1.AppError("You cannot change your own role", 403);
                }
                if (user.role === "user") {
                    user.role = "admin";
                }
                else {
                    user.role = "user";
                }
                return [4 /*yield*/, user.save()];
            case 2:
                _b.sent();
                return [2 /*return*/, res.status(200).json({
                        success: true,
                        user: user,
                        role: user.role
                    })];
        }
    });
}); });
exports.userProfile = (0, asyncHandler_js_1.asyncHandler)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userData;
    return __generator(this, function (_a) {
        user = req.user;
        if (!user) {
            throw new AppError_js_1.AppError("User not found", 404);
        }
        userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            // avatar:user.avatar
        };
        return [2 /*return*/, res.status(200).json({ user: userData })];
    });
}); });
