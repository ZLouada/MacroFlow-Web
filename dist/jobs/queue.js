"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueHealth = exports.closeQueues = exports.addAnalyticsJob = exports.addSimulationJob = exports.addFileCleanupJob = exports.addActivityLogJob = exports.addNotificationJob = exports.addEmailJob = exports.createQueueEvents = exports.analyticsQueue = exports.simulationQueue = exports.fileCleanupQueue = exports.activityLogQueue = exports.notificationQueue = exports.emailQueue = exports.QUEUE_NAMES = exports.redisConnection = void 0;
const bullmq_1 = require("bullmq");
const index_js_1 = require("../config/index.js");
const logger_js_1 = require("../utils/logger.js");
// Redis connection options for BullMQ
exports.redisConnection = {
    host: new URL(index_js_1.config.redis.url).hostname || 'localhost',
    port: parseInt(new URL(index_js_1.config.redis.url).port) || 6379,
    password: index_js_1.config.redis.password,
};
// Queue names
exports.QUEUE_NAMES = {
    EMAIL: 'email-queue',
    NOTIFICATIONS: 'notifications-queue',
    ACTIVITY_LOG: 'activity-log-queue',
    FILE_CLEANUP: 'file-cleanup-queue',
    SIMULATION: 'simulation-queue',
    ANALYTICS: 'analytics-queue',
};
// Create queues
exports.emailQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.EMAIL, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
exports.notificationQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.NOTIFICATIONS, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 500,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
exports.activityLogQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.ACTIVITY_LOG, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 500,
        },
        removeOnComplete: 1000,
        removeOnFail: 500,
    },
});
exports.fileCleanupQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.FILE_CLEANUP, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
    },
});
exports.simulationQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.SIMULATION, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
    },
});
exports.analyticsQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.ANALYTICS, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: 1000,
        removeOnFail: 500,
    },
});
// Queue events for monitoring
const createQueueEvents = (queueName) => {
    const events = new bullmq_1.QueueEvents(queueName, { connection: exports.redisConnection });
    events.on('completed', ({ jobId }) => {
        logger_js_1.logger.debug(`Job ${jobId} completed in ${queueName}`);
    });
    events.on('failed', ({ jobId, failedReason }) => {
        logger_js_1.logger.error(`Job ${jobId} failed in ${queueName}`, { reason: failedReason });
    });
    events.on('stalled', ({ jobId }) => {
        logger_js_1.logger.warn(`Job ${jobId} stalled in ${queueName}`);
    });
    return events;
};
exports.createQueueEvents = createQueueEvents;
// Helper functions for adding jobs
const addEmailJob = async (data, priority) => {
    return exports.emailQueue.add('send-email', data, { priority });
};
exports.addEmailJob = addEmailJob;
const addNotificationJob = async (data, delay) => {
    return exports.notificationQueue.add('create-notification', data, { delay });
};
exports.addNotificationJob = addNotificationJob;
const addActivityLogJob = async (data) => {
    return exports.activityLogQueue.add('log-activity', data);
};
exports.addActivityLogJob = addActivityLogJob;
const addFileCleanupJob = async (data, delay) => {
    return exports.fileCleanupQueue.add('cleanup-files', data, { delay });
};
exports.addFileCleanupJob = addFileCleanupJob;
const addSimulationJob = async (data) => {
    return exports.simulationQueue.add('run-simulation', data);
};
exports.addSimulationJob = addSimulationJob;
const addAnalyticsJob = async (data) => {
    return exports.analyticsQueue.add('track-analytics', data);
};
exports.addAnalyticsJob = addAnalyticsJob;
// Graceful shutdown
const closeQueues = async () => {
    logger_js_1.logger.info('Closing job queues...');
    await Promise.all([
        exports.emailQueue.close(),
        exports.notificationQueue.close(),
        exports.activityLogQueue.close(),
        exports.fileCleanupQueue.close(),
        exports.simulationQueue.close(),
        exports.analyticsQueue.close(),
    ]);
    logger_js_1.logger.info('All queues closed');
};
exports.closeQueues = closeQueues;
// Health check for queues
const getQueueHealth = async () => {
    const queues = [
        { name: exports.QUEUE_NAMES.EMAIL, queue: exports.emailQueue },
        { name: exports.QUEUE_NAMES.NOTIFICATIONS, queue: exports.notificationQueue },
        { name: exports.QUEUE_NAMES.ACTIVITY_LOG, queue: exports.activityLogQueue },
        { name: exports.QUEUE_NAMES.FILE_CLEANUP, queue: exports.fileCleanupQueue },
        { name: exports.QUEUE_NAMES.SIMULATION, queue: exports.simulationQueue },
        { name: exports.QUEUE_NAMES.ANALYTICS, queue: exports.analyticsQueue },
    ];
    const health = await Promise.all(queues.map(async ({ name, queue }) => {
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