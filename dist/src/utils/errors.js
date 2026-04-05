"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.TooManyRequestsError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, isOperational = true, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', code) {
        super(message, 400, true, code);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code) {
        super(message, 401, true, code);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code) {
        super(message, 403, true, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Not Found', code) {
        super(message, 404, true, code);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Conflict', code) {
        super(message, 409, true, code);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    errors;
    constructor(message = 'Validation Error', errors) {
        super(message, 422, true, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too Many Requests', code) {
        super(message, 429, true, code);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error', code) {
        super(message, 500, false, code);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map