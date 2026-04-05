import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthenticatedRequest } from '../types/index';
export declare const errorHandler: (err: Error, _req: AuthenticatedRequest, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: AuthenticatedRequest, res: Response, _next: NextFunction) => void;
type AsyncHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response>;
export declare const asyncHandler: (fn: AsyncHandler) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}
export declare const validate: (schemas: ValidationSchemas) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map