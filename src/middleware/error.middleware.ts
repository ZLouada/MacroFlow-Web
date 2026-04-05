import { Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ApiResponse, AuthenticatedRequest } from '../types/index.js';
import config from '../config/index.js';

// ===========================================
// Error Handler Middleware
// ===========================================

export const errorHandler = (
  err: Error,
  _req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    };

    if (err instanceof ValidationError && err.errors) {
      (response as ApiResponse & { errors: Record<string, string[]> }).errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
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
  logger.error('Unexpected error:', err);

  res.status(500).json({
    success: false,
    error: config.server.isProduction
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
  });
};

// ===========================================
// Not Found Handler
// ===========================================

export const notFoundHandler = (
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// ===========================================
// Async Handler Wrapper
// ===========================================

type AsyncHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncHandler) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===========================================
// Validation Middleware Factory
// ===========================================

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
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
    } catch (error) {
      next(error);
    }
  };
};
