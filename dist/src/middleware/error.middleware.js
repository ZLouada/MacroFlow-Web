"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = __importDefault(require("../config/index.js"));
// ===========================================
// Error Handler Middleware
// ===========================================
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof errors_js_1.AppError) {
        const response = {
            success: false,
            error: err.message,
        };
        if (err instanceof errors_js_1.ValidationError && err.errors) {
            response.errors = err.errors;
        }
        res.status(err.statusCode).json(response);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.errors.forEach((error) => {
            const path = error.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(error.message);
        });
        res.status(422).json({
            success: false,
            error: 'Validation Error',
            errors,
        });
        return;
    }
    // Log unexpected errors
    logger_js_1.logger.error('Unexpected error:', err);
    res.status(500).json({
        success: false,
        error: index_js_1.default.server.isProduction
            ? 'Internal Server Error'
            : err.message || 'Internal Server Error',
    });
};
exports.errorHandler = errorHandler;
// ===========================================
// Not Found Handler
// ===========================================
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const validate = (schemas) => {
    return (req, _res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=error.middleware.js.map