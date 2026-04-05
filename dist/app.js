"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./config/index");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const index_2 = __importDefault(require("./routes/index"));
// Create Express app
const app = (0, express_1.default)();
// ===========================================
// Trust Proxy (for rate limiting behind reverse proxy)
// ===========================================
if (index_1.config.server.isProduction) {
    app.set('trust proxy', 1);
}
// ===========================================
// Security Middleware
// ===========================================
// Helmet - Set security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: index_1.config.server.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
}));
// CORS
app.use((0, cors_1.default)({
    origin: index_1.config.cors.origin.split(',').map(o => o.trim()),
    credentials: index_1.config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page', 'X-Total-Pages'],
    maxAge: 86400, // 24 hours
}));
// ===========================================
// Request Parsing
// ===========================================
// Parse JSON bodies
app.use(express_1.default.json({ limit: '10mb' }));
// Parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Parse cookies
app.use((0, cookie_parser_1.default)());
// ===========================================
// Compression
// ===========================================
app.use((0, compression_1.default)());
// ===========================================
// Logging
// ===========================================
// HTTP request logging
if (index_1.config.server.isDevelopment) {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => {
                logger_1.logger.http(message.trim());
            },
        },
    }));
}
// Request ID middleware
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] ||
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
});
// ===========================================
// Rate Limiting
// ===========================================
app.use(rateLimit_middleware_1.generalRateLimiter);
// ===========================================
// API Routes
// ===========================================
app.use(index_2.default);
// ===========================================
// Static Frontend Serving (Production)
// ===========================================
if (index_1.config.server.isProduction) {
    const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
    // Serve static files from the React app
    app.use(express_1.default.static(clientDistPath));
    // Handle React routing - return index.html for any unknown routes
    // (that aren't API routes which are already handled above)
    app.get('*', (req, res, next) => {
        // Skip API routes - let them fall through to 404 handler
        if (req.path.startsWith('/api') || req.path.startsWith('/health') ||
            req.path.startsWith('/ready') || req.path.startsWith('/live')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
// ===========================================
// Error Handling
// ===========================================
// 404 handler (for API routes)
app.use(error_middleware_1.notFoundHandler);
// Global error handler
app.use(error_middleware_1.errorHandler);
// ===========================================
// Graceful Shutdown Helper
// ===========================================
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    // Close database connections, queues, etc.
    const { prisma } = await Promise.resolve().then(() => __importStar(require('./config/database.js')));
    const { closeRedis } = await Promise.resolve().then(() => __importStar(require('./config/redis.js')));
    const { closeQueues } = await Promise.resolve().then(() => __importStar(require('./jobs/queue.js')));
    const { closeWorkers } = await Promise.resolve().then(() => __importStar(require('./jobs/workers.js')));
    await Promise.all([
        prisma.$disconnect(),
        closeRedis(),
        closeQueues(),
        closeWorkers(),
    ]);
    logger_1.logger.info('Graceful shutdown complete');
};
exports.gracefulShutdown = gracefulShutdown;
exports.default = app;
//# sourceMappingURL=app.js.map