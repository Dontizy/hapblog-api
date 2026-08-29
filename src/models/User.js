"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please add name!"],
    },
    username: {
        type: String,
        required: [true, "Please add a username"],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: [
            /^[a-z0-9_-]+$/,
            "Username can only contain letters, numbers, underscores, and hyphens",
        ],
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email",
        ],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    avatar: {
        type: String,
        required: false,
        default: "https://res.cloudinary.com/dxdtdqxse/image/upload/v1788041337/file_000000009b5c8210a3ce078150618325-removebg-preview_hgmaxv.png"
    },
    bio: {
        type: String,
        required: false,
        trim: true,
        maxlength: 200,
        default: "This user hasn't added a bio yet. Check out their latest posts to learn more.",
    },
    followers: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    following: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    avatarPublicId: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true,
        minlength: 5,
        select: false,
    },
    bookmarks: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Blog",
        default: [],
    },
    suspendedUntil: {
        type: Date,
        default: undefined,
    },
    resetPasswordToken: {
        type: String,
        select: false,
    },
    resetPasswordExpire: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)("User", userSchema);
exports.default = exports.User;
