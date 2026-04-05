"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueHealth = exports.closeQueues = exports.addAnalyticsJob = exports.addSimulationJob = exports.addFileCleanupJob = exports.addActivityLogJob = exports.addNotificationJob = exports.addEmailJob = exports.createQueueEvents = exports.analyticsQueue = exports.simulationQueue = exports.fileCleanupQueue = exports.activityLogQueue = exports.notificationQueue = exports.emailQueue = exports.QUEUE_NAMES = exports.redisConnection = void 0;
const bullmq_1 = require("bullmq");
const index_1 = require("../config/index");
const logger_1 = require("../utils/logger");
// Check if Redis is configured
const isRedisConfigured = () => {
    return !!(index_1.config.redis.url && index_1.config.redis.url !== 'redis://localhost:6379');
};
// Parse Redis URL safely
const parseRedisUrl = (url) => {
    if (!isRedisConfigured()) {
        return null;
    }
    try {
        const parsed = new URL(url);
        return {
            host: parsed.hostname || 'localhost',
            port: parseInt(parsed.port) || 6379,
            password: parsed.password || index_1.config.redis.password || undefined,
        };
    }
    catch {
        return null;
    }
};
// Redis connection options for BullMQ (null if not configured)
exports.redisConnection = parseRedisUrl(index_1.config.redis.url);
// Queue names
exports.QUEUE_NAMES = {
    EMAIL: 'email-queue',
    NOTIFICATIONS: 'notifications-queue',
    ACTIVITY_LOG: 'activity-log-queue',
    FILE_CLEANUP: 'file-cleanup-queue',
    SIMULATION: 'simulation-queue',
    ANALYTICS: 'analytics-queue',
};
// Create queues only if Redis is configured
const createQueue = (name, options) => {
    if (!exports.redisConnection) {
        return null;
    }
    return new bullmq_1.Queue(name, {
        connection: exports.redisConnection,
        ...options,
    });
};
const defaultEmailOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
};
const defaultNotificationOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 500 },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
};
const defaultActivityOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 500 },
        removeOnComplete: 1000,
        removeOnFail: 500,
    },
};
const defaultFileCleanupOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 100,
    },
};
const defaultSimulationOptions = {
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
    },
};
const defaultAnalyticsOptions = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 500,
    },
};
// Queues (null if Redis not configured)
exports.emailQueue = createQueue(exports.QUEUE_NAMES.EMAIL, defaultEmailOptions);
exports.notificationQueue = createQueue(exports.QUEUE_NAMES.NOTIFICATIONS, defaultNotificationOptions);
exports.activityLogQueue = createQueue(exports.QUEUE_NAMES.ACTIVITY_LOG, defaultActivityOptions);
exports.fileCleanupQueue = createQueue(exports.QUEUE_NAMES.FILE_CLEANUP, defaultFileCleanupOptions);
exports.simulationQueue = createQueue(exports.QUEUE_NAMES.SIMULATION, defaultSimulationOptions);
exports.analyticsQueue = createQueue(exports.QUEUE_NAMES.ANALYTICS, defaultAnalyticsOptions);
// Queue events for monitoring
const createQueueEvents = (queueName) => {
    if (!exports.redisConnection) {
        return null;
    }
    const events = new bullmq_1.QueueEvents(queueName, { connection: exports.redisConnection });
    events.on('completed', ({ jobId }) => {
        logger_1.logger.debug(`Job ${jobId} completed in ${queueName}`);
    });
    events.on('failed', ({ jobId, failedReason }) => {
        logger_1.logger.error(`Job ${jobId} failed in ${queueName}`, { reason: failedReason });
    });
    events.on('stalled', ({ jobId }) => {
        logger_1.logger.warn(`Job ${jobId} stalled in ${queueName}`);
    });
    return events;
};
exports.createQueueEvents = createQueueEvents;
// Helper functions for adding jobs (no-op if Redis not configured)
const addEmailJob = async (data, priority) => {
    if (!exports.emailQueue) {
        logger_1.logger.debug('Redis not configured, skipping email job', { type: data.type });
        return null;
    }
    return exports.emailQueue.add('send-email', data, { priority });
};
exports.addEmailJob = addEmailJob;
const addNotificationJob = async (data, delay) => {
    if (!exports.notificationQueue) {
        logger_1.logger.debug('Redis not configured, skipping notification job');
        return null;
    }
    return exports.notificationQueue.add('create-notification', data, { delay });
};
exports.addNotificationJob = addNotificationJob;
const addActivityLogJob = async (data) => {
    if (!exports.activityLogQueue) {
        logger_1.logger.debug('Redis not configured, skipping activity log job');
        return null;
    }
    return exports.activityLogQueue.add('log-activity', data);
};
exports.addActivityLogJob = addActivityLogJob;
const addFileCleanupJob = async (data, delay) => {
    if (!exports.fileCleanupQueue) {
        logger_1.logger.debug('Redis not configured, skipping file cleanup job');
        return null;
    }
    return exports.fileCleanupQueue.add('cleanup-files', data, { delay });
};
exports.addFileCleanupJob = addFileCleanupJob;
const addSimulationJob = async (data) => {
    if (!exports.simulationQueue) {
        logger_1.logger.debug('Redis not configured, skipping simulation job');
        return null;
    }
    return exports.simulationQueue.add('run-simulation', data);
};
exports.addSimulationJob = addSimulationJob;
const addAnalyticsJob = async (data) => {
    if (!exports.analyticsQueue) {
        logger_1.logger.debug('Redis not configured, skipping analytics job');
        return null;
    }
    return exports.analyticsQueue.add('track-analytics', data);
};
exports.addAnalyticsJob = addAnalyticsJob;
// Graceful shutdown
const closeQueues = async () => {
    if (!exports.redisConnection) {
        logger_1.logger.info('No queues to close (Redis not configured)');
        return;
    }
    logger_1.logger.info('Closing job queues...');
    const queues = [exports.emailQueue, exports.notificationQueue, exports.activityLogQueue, exports.fileCleanupQueue, exports.simulationQueue, exports.analyticsQueue];
    await Promise.all(queues.filter(q => q !== null).map(q => q.close()));
    logger_1.logger.info('All queues closed');
};
exports.closeQueues = closeQueues;
// Health check for queues
const getQueueHealth = async () => {
    if (!exports.redisConnection) {
        return { status: 'disabled', message: 'Redis not configured' };
    }
    const queues = [
        { name: exports.QUEUE_NAMES.EMAIL, queue: exports.emailQueue },
        { name: exports.QUEUE_NAMES.NOTIFICATIONS, queue: exports.notificationQueue },
        { name: exports.QUEUE_NAMES.ACTIVITY_LOG, queue: exports.activityLogQueue },
        { name: exports.QUEUE_NAMES.FILE_CLEANUP, queue: exports.fileCleanupQueue },
        { name: exports.QUEUE_NAMES.SIMULATION, queue: exports.simulationQueue },
        { name: exports.QUEUE_NAMES.ANALYTICS, queue: exports.analyticsQueue },
    ];
    const health = await Promise.all(queues.map(async ({ name, queue }) => {
        if (!queue) {
            return { name, status: 'disabled' };
        }
        try {
            const [waiting, active, completed, failed] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
            ]);
            return {
                name,
                status: 'healthy',
                waiting,
                active,
                completed,
                failed,
            };
        }
        catch (error) {
            return {
                name,
                status: 'unhealthy',
                error: error.message,
            };
        }
    }));
    return health;
};
exports.getQueueHealth = getQueueHealth;
//# sourceMappingURL=queue.js.map