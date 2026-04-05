import { Response, Request, NextFunction } from 'express';
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const createRateLimiter: (maxRequests: number, windowMs?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const slowDown: (delayAfter: number, delayMs: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rateLimit.middleware.d.ts.map