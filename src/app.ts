import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app: Express = express();

// ===========================================
// Trust Proxy (for rate limiting behind reverse proxy)
// ===========================================
if (config.server.isProduction) {
  app.set('trust proxy', 1);
}

// ===========================================
// Security Middleware
// ===========================================

// Helmet - Set security headers
app.use(helmet({
  contentSecurityPolicy: config.server.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: config.cors.origin.split(',').map(o => o.trim()),
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page', 'X-Total-Pages'],
  maxAge: 86400, // 24 hours
}));

// ===========================================
// Request Parsing
// ===========================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// ===========================================
// Compression
// ===========================================
app.use(compression());

// ===========================================
// Logging
// ===========================================

// HTTP request logging
if (config.server.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }));
}

// Request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// ===========================================
// Rate Limiting
// ===========================================
app.use(generalRateLimiter);

// ===========================================
// API Routes
// ===========================================
app.use(routes);

// ===========================================
// Static Frontend Serving (Production)
// ===========================================
if (config.server.isProduction) {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  
  // Serve static files from the React app
  app.use(express.static(clientDistPath));
  
  // Handle React routing - return index.html for any unknown routes
  // (that aren't API routes which are already handled above)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // Skip API routes - let them fall through to 404 handler
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || 
        req.path.startsWith('/ready') || req.path.startsWith('/live')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ===========================================
// Error Handling
// ===========================================

// 404 handler (for API routes)
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ===========================================
// Graceful Shutdown Helper
// ===========================================
export const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close database connections, queues, etc.
  const { prisma } = await import('./config/database.js');
  const { closeRedis } = await import('./config/redis.js');
  const { closeQueues } = await import('./jobs/queue.js');
  const { closeWorkers } = await import('./jobs/workers.js');
  
  await Promise.all([
    prisma.$disconnect(),
    closeRedis(),
    closeQueues(),
    closeWorkers(),
  ]);
  
  logger.info('Graceful shutdown complete');
};

export default app;
