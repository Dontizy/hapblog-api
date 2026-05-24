"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var logger_js_1 = require("../utils/logger.js");
var errorHandler = function (err, req, res, next) {
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        return res.status(400).json({
            success: false,
            message: err.message,
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        });
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: "Invalid resource id",
            stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        });
    }
    var statusCode = err.statusCode || 500;
    // Log only server errors
    if (statusCode >= 500) {
        logger_js_1.logger.error({
            message: err.message,
            stack: err.stack,
            method: req.method,
            url: req.originalUrl,
        });
    }
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};
exports.default = errorHandler;
