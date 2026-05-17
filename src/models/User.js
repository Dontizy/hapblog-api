"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please add name!"]
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        trim: true,
        minlength: 5,
        select: false
    }
}, {
    timestamps: true
});
exports.User = (0, mongoose_1.model)('User', userSchema);
exports.default = exports.User;
