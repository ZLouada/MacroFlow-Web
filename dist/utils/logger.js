"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const index_1 = require("../config/index");
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});
const devFormat = combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), customFormat);
const prodFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), winston_1.default.format.json());
exports.logger = winston_1.default.createLogger({
    level: index_1.config.logging.level,
    format: index_1.config.server.isProduction ? prodFormat : devFormat,
    transports: [
        new winston_1.default.transports.Console(),
        ...(index_1.config.server.isProduction
            ? [
                new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
            ]
            : []),
    ],
});
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map