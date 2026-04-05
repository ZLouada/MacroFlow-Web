"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_js_1 = __importDefault(require("./auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./user.routes.js"));
const workspace_routes_js_1 = __importDefault(require("./workspace.routes.js"));
const project_routes_js_1 = __importDefault(require("./project.routes.js"));
const task_routes_js_1 = __importDefault(require("./task.routes.js"));
const column_routes_js_1 = __importDefault(require("./column.routes.js"));
const comment_routes_js_1 = __importDefault(require("./comment.routes.js"));
const label_routes_js_1 = __importDefault(require("./label.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./dashboard.routes.js"));
const notification_routes_js_1 = __importDefault(require("./notification.routes.js"));
const search_routes_js_1 = __importDefault(require("./search.routes.js"));
const simulation_routes_js_1 = __importDefault(require("./simulation.routes.js"));
const database_js_1 = require("../config/database.js");
const redis_js_1 = require("../config/redis.js");
const queue_js_1 = require("../jobs/queue.js");
const router = (0, express_1.Router)();
// ===========================================
// Health Check Routes
// ===========================================
/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with dependencies
 * @access  Public
 */
router.get('/health/detailed', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {},
        memory: process.memoryUsage(),
    };
    // Check database
    const dbStart = Date.now();
    try {
        await database_js_1.prisma.$queryRaw `SELECT 1`;
        health.services.database = {
            status: 'healthy',
            latency: Date.now() - dbStart,
        };
    }
    catch (error) {
        health.status = 'degraded';
        health.services.database = {
            status: 'unhealthy',
            error: error.message,
        };
    }
    // Check Redis
    const redisStart = Date.now();
    try {
        const redis = (0, redis_js_1.getRedisClient)();
        await redis.ping();
        health.services.redis = {
            status: 'healthy',
            latency: Date.now() - redisStart,
        };
    }
    catch (error) {
        health.status = 'degraded';
        health.services.redis = {
            status: 'unhealthy',
            error: error.message,
        };
    }
    // Check queues
    try {
        const queues = await (0, queue_js_1.getQueueHealth)();
        health.services.queues = {
            status: queues.every((q) => q.status === 'healthy') ? 'healthy' : 'degraded',
        };
    }
    catch (error) {
        health.services.queues = {
            status: 'unknown',
            error: error.message,
        };
    }
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});
/**
 * @route   GET /ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', async (req, res) => {
    try {
        await Promise.all([
            database_js_1.prisma.$queryRaw `SELECT 1`,
            (0, redis_js_1.getRedisClient)().ping(),
        ]);
        res.json({ status: 'ready' });
    }
    catch {
        res.status(503).json({ status: 'not ready' });
    }
});
/**
 * @route   GET /live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
    res.json({ status: 'alive' });
});
// ===========================================
// API Version 1 Routes
// ===========================================
const v1Router = (0, express_1.Router)();
// Auth routes
v1Router.use('/auth', auth_routes_js_1.default);
// User routes
v1Router.use('/users', user_routes_js_1.default);
// Workspace routes
v1Router.use('/workspaces', workspace_routes_js_1.default);
// Project routes (both workspace-scoped and direct)
v1Router.use('/projects', project_routes_js_1.default);
// Task routes (both project-scoped and direct)
v1Router.use('/tasks', task_routes_js_1.default);
// Column routes (both project-scoped and direct)
v1Router.use('/columns', column_routes_js_1.default);
// Comment routes (both task-scoped and direct)
v1Router.use('/comments', comment_routes_js_1.default);
// Label routes
v1Router.use('/labels', label_routes_js_1.default);
// Dashboard routes
v1Router.use('/dashboard', dashboard_routes_js_1.default);
// Notification routes
v1Router.use('/notifications', notification_routes_js_1.default);
// Search routes
v1Router.use('/search', search_routes_js_1.default);
// Simulation routes
v1Router.use('/simulations', simulation_routes_js_1.default);
// Mount v1 routes
router.use('/api/v1', v1Router);
// ===========================================
// API Info
// ===========================================
/**
 * @route   GET /api
 * @desc    API information
 * @access  Public
 */
router.get('/api', (req, res) => {
    res.json({
        name: 'MacroFlow API',
        version: '1.0.0',
        description: 'Project management and macroeconomic simulation platform API',
        documentation: '/api/docs',
        endpoints: {
            v1: '/api/v1',
        },
    });
});
/**
 * @route   GET /api/v1
 * @desc    API v1 endpoint list
 * @access  Public
 */
v1Router.get('/', (req, res) => {
    res.json({
        version: 'v1',
        endpoints: [
            { path: '/auth', description: 'Authentication' },
            { path: '/users', description: 'User management' },
            { path: '/workspaces', description: 'Workspace management' },
            { path: '/projects', description: 'Project management' },
            { path: '/tasks', description: 'Task management' },
            { path: '/columns', description: 'Kanban columns' },
            { path: '/comments', description: 'Comments and attachments' },
            { path: '/labels', description: 'Labels' },
            { path: '/dashboard', description: 'Dashboard and analytics' },
            { path: '/notifications', description: 'Notifications' },
            { path: '/search', description: 'Search' },
            { path: '/simulations', description: 'Economic simulations' },
        ],
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map