import rateLimit from 'express-rate-limit';
import { config } from '../config/index';
import { TooManyRequestsError } from '../utils/errors';
import { Response, Request, NextFunction } from 'express';

// ===========================================
// General Rate Limiter
// ===========================================

export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many requests, please try again later'));
  },
});

// ===========================================
// Auth Rate Limiter (Stricter)
// ===========================================

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: { success: false, error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts, please try again later'));
  },
  skipSuccessfulRequests: true,
});

// ===========================================
// API Rate Limiter (Per Route)
// ===========================================

export const createRateLimiter = (maxRequests: number, windowMs?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimit.windowMs,
    max: maxRequests,
    message: { success: false, error: 'Rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    },
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError('Rate limit exceeded'));
    },
  });
};

// ===========================================
// Upload Rate Limiter
// ===========================================

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: { success: false, error: 'Upload limit exceeded, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Upload limit exceeded, please try again later'));
  },
});

// ===========================================
// Slow Down Middleware (for expensive operations)
// ===========================================

export const slowDown = (delayAfter: number, delayMs: number) => {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const now = Date.now();

    let record = requests.get(key);
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + config.rateLimit.windowMs };
      requests.set(key, record);
    }

    record.count++;

    if (record.count > delayAfter) {
      const delay = (record.count - delayAfter) * delayMs;
      setTimeout(() => next(), Math.min(delay, 10000)); // Cap at 10 seconds
    } else {
      next();
    }
  };
};
