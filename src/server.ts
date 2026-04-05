import http from 'http';
import app, { gracefulShutdown } from './app';
import { config } from './config/index';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './services/socket.service';
import { startWorkers } from './jobs/workers';

// Create HTTP server
const server = http.createServer(app);

// ===========================================
// Socket.io Setup
// ===========================================
// Initialize socket service (creates and configures Socket.io internally)
const io = initializeSocket(server);

// ===========================================
// Server Startup
// ===========================================
const startServer = async () => {
  try {
    // Test database connection (MongoDB)
    await prisma.user.findFirst({ take: 1 });
    logger.info('Database connection established');

    // Try Redis connection (optional - won't fail if not available)
    const redisConnected = await connectRedis();
    if (redisConnected) {
      logger.info('Redis connection established');
      // Only start workers if Redis is available
      startWorkers();
      logger.info('Background workers started');
    } else {
      logger.warn('Running without Redis - background jobs disabled');
    }

    // Start HTTP server
    server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.nodeEnv}`);
      logger.info(`API Version: ${config.server.apiVersion}`);
      logger.info(`Health check: http://localhost:${config.server.port}/health`);
      logger.info(`API Base: http://localhost:${config.server.port}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ===========================================
// Graceful Shutdown Handlers
// ===========================================
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down...`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close socket.io connections
    io.close(() => {
      logger.info('Socket.io server closed');
    });
    
    // Run graceful shutdown
    await gracefulShutdown(signal);
    
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Start the server
startServer();

export { server, io };
