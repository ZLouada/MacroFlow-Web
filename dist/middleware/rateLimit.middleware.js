"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slowDown = exports.uploadRateLimiter = exports.createRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../utils/errors.js");
// ===========================================
// General Rate Limiter
// ===========================================
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: index_js_1.config.rateLimit.windowMs,
    max: index_js_1.config.rateLimit.maxRequests,
    message: { success: false, error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    },
    handler: (_req, _res, next) => {
        next(new errors_js_1.TooManyRequestsError('Too many requests, please try again later'));
    },
});
// ===========================================
// Auth Rate Limiter (Stricter)
// ===========================================
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: index_js_1.config.rateLimit.windowMs,
    max: index_js_1.config.rateLimit.authMaxRequests,
    message: { success: false, error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    },
    handler: (_req, _res, next) => {
        next(new errors_js_1.TooManyRequestsError('Too many authentication attempts, please try again later'));
    },
    skipSuccessfulRequests: true,
});
// ===========================================
// API Rate Limiter (Per Route)
// ===========================================
const createRateLimiter = (maxRequests, windowMs) => {
    return (0, express_rate_limit_1.default)({
        windowMs: windowMs || index_js_1.config.rateLimit.windowMs,
        max: maxRequests,
        message: { success: false, error: 'Rate limit exceeded' },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        },
        handler: (_req, _res, next) => {
            next(new errors_js_1.TooManyRequestsError('Rate limit exceeded'));
        },
    });
};
exports.createRateLimiter = createRateLimiter;
// ===========================================
// Upload Rate Limiter
// ===========================================
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: { success: false, error: 'Upload limit exceeded, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    },
    handler: (_req, _res, next) => {
        next(new errors_js_1.TooManyRequestsError('Upload limit exceeded, please try again later'));
    },
});
// ===========================================
// Slow Down Middleware (for expensive operations)
// ===========================================
const slowDown = (delayAfter, delayMs) => {
    const requests = new Map();
    return (req, res, next) => {
        const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const now = Date.now();
        let record = requests.get(key);
        if (!record || record.resetAt < now) {
            record = { count: 0, resetAt: now + index_js_1.config.rateLimit.windowMs };
            requests.set(key, record);
        }
        record.count++;
        if (record.count > delayAfter) {
            const delay = (record.count - delayAfter) * delayMs;
            setTimeout(() => next(), Math.min(delay, 10000)); // Cap at 10 seconds
        }
        else {
            next();
        }
    };
};
exports.slowDown = slowDown;
//# sourceMappingURL=rateLimit.middleware.js.map