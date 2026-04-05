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
exports.io = exports.server = void 0;
const http_1 = __importDefault(require("http"));
const app_js_1 = __importStar(require("./app.js"));
const index_js_1 = require("./config/index.js");
const logger_js_1 = require("./utils/logger.js");
const database_js_1 = require("./config/database.js");
const redis_js_1 = require("./config/redis.js");
const socket_service_js_1 = require("./services/socket.service.js");
const workers_js_1 = require("./jobs/workers.js");
// Create HTTP server
const server = http_1.default.createServer(app_js_1.default);
exports.server = server;
// ===========================================
// Socket.io Setup
// ===========================================
// Initialize socket service (creates and configures Socket.io internally)
const io = (0, socket_service_js_1.initializeSocket)(server);
exports.io = io;
// ===========================================
// Server Startup
// ===========================================
const startServer = async () => {
    try {
        // Test database connection (MongoDB)
        await database_js_1.prisma.user.findFirst({ take: 1 });
        logger_js_1.logger.info('Database connection established');
        // Try Redis connection (optional - won't fail if not available)
        const redisConnected = await (0, redis_js_1.connectRedis)();
        if (redisConnected) {
            logger_js_1.logger.info('Redis connection established');
            // Only start workers if Redis is available
            (0, workers_js_1.startWorkers)();
            logger_js_1.logger.info('Background workers started');
        }
        else {
            logger_js_1.logger.warn('Running without Redis - background jobs disabled');
        }
        // Start HTTP server
        server.listen(index_js_1.config.server.port, () => {
            logger_js_1.logger.info(`Server running on port ${index_js_1.config.server.port}`);
            logger_js_1.logger.info(`Environment: ${index_js_1.config.server.nodeEnv}`);
            logger_js_1.logger.info(`API Version: ${index_js_1.config.server.apiVersion}`);
            logger_js_1.logger.info(`Health check: http://localhost:${index_js_1.config.server.port}/health`);
            logger_js_1.logger.info(`API Base: http://localhost:${index_js_1.config.server.port}/api/v1`);
        });
    }
    catch (error) {
        logger_js_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
// ===========================================
// Graceful Shutdown Handlers
// ===========================================
const shutdown = async (signal) => {
    logger_js_1.logger.info(`Received ${signal}. Shutting down...`);
    // Stop accepting new connections
    server.close(async () => {
        logger_js_1.logger.info('HTTP server closed');
        // Close socket.io connections
        io.close(() => {
            logger_js_1.logger.info('Socket.io server closed');
        });
        // Run graceful shutdown
        await (0, app_js_1.gracefulShutdown)(signal);
        process.exit(0);
    });
    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger_js_1.logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};
// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_js_1.logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_js_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map