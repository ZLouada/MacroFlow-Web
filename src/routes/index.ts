import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import workspaceRoutes from './workspace.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import columnRoutes from './column.routes';
import commentRoutes from './comment.routes';
import labelRoutes from './label.routes';
import dashboardRoutes from './dashboard.routes';
import notificationRoutes from './notification.routes';
import searchRoutes from './search.routes';
import simulationRoutes from './simulation.routes';
import { prisma } from '../config/database';
import { getRedisClient } from '../config/redis';
import { getQueueHealth } from '../jobs/queue';

const router = Router();

// ===========================================
// Health Check Routes
// ===========================================

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/health', (req: Request, res: Response) => {
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
router.get('/health/detailed', async (req: Request, res: Response) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    services: Record<string, { status: string; latency?: number; error?: string }>;
    memory: NodeJS.MemoryUsage;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
    memory: process.memoryUsage(),
  };

  // Check database (MongoDB)
  const dbStart = Date.now();
  try {
    // Simple findFirst query to check database connectivity
    await prisma.user.findFirst({ take: 1 });
    health.services.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.status = 'degraded';
    health.services.database = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
      health.services.redis = {
        status: 'healthy',
        latency: Date.now() - redisStart,
      };
    } else {
      health.services.redis = {
        status: 'unavailable',
      };
    }
  } catch (error) {
    health.status = 'degraded';
    health.services.redis = {
      status: 'unhealthy',
      error: (error as Error).message,
    };
  }

  // Check queues
  try {
    const queues = await getQueueHealth();
    health.services.queues = {
      status: queues.every((q: any) => q.status === 'healthy') ? 'healthy' : 'degraded',
    };
  } catch (error) {
    health.services.queues = {
      status: 'unknown',
      error: (error as Error).message,
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
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connection (required)
    await prisma.user.findFirst({ take: 1 });
    
    // Check Redis if available (optional)
    const redis = getRedisClient();
    if (redis) {
      await redis.ping();
    }
    
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

/**
 * @route   GET /live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

// ===========================================
// API Version 1 Routes
// ===========================================

const v1Router = Router();

// Auth routes
v1Router.use('/auth', authRoutes);

// User routes
v1Router.use('/users', userRoutes);

// Workspace routes
v1Router.use('/workspaces', workspaceRoutes);

// Project routes (both workspace-scoped and direct)
v1Router.use('/projects', projectRoutes);

// Task routes (both project-scoped and direct)
v1Router.use('/tasks', taskRoutes);

// Column routes (both project-scoped and direct)
v1Router.use('/columns', columnRoutes);

// Comment routes (both task-scoped and direct)
v1Router.use('/comments', commentRoutes);

// Label routes
v1Router.use('/labels', labelRoutes);

// Dashboard routes
v1Router.use('/dashboard', dashboardRoutes);

// Notification routes
v1Router.use('/notifications', notificationRoutes);

// Search routes
v1Router.use('/search', searchRoutes);

// Simulation routes (advanced/scenario-based)
v1Router.use('/simulations', simulationRoutes);

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
router.get('/api', (req: Request, res: Response) => {
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
v1Router.get('/', (req: Request, res: Response) => {
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

export default router;
