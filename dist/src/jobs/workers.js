"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsWorker = exports.simulationWorker = exports.fileCleanupWorker = exports.activityLogWorker = exports.notificationWorker = exports.emailWorker = exports.startWorkers = exports.closeWorkers = void 0;
const bullmq_1 = require("bullmq");
const queue_1 = require("./queue");
const logger_1 = require("../utils/logger");
const email_service_1 = require("../services/email.service");
const notification_service_1 = require("../services/notification.service");
const activity_service_1 = require("../services/activity.service");
const upload_service_1 = require("../services/upload.service");
const simulation_service_1 = require("../services/simulation.service");
const database_1 = require("../config/database");
// Email worker
const emailWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.EMAIL, async (job) => {
    const { type, to, data } = job.data;
    logger_1.logger.info(`Processing email job: ${type}`, { jobId: job.id, to });
    try {
        switch (type) {
            case 'welcome':
            case 'email-verification':
                await email_service_1.emailService.sendVerificationEmail(to, data.name, data.token);
                break;
            case 'password-reset':
                await email_service_1.emailService.sendPasswordResetEmail(to, data.name, data.resetToken);
                break;
            case 'workspace-invitation':
                await email_service_1.emailService.sendWorkspaceInviteEmail(to, data.inviterName, data.workspaceName, data.workspaceId);
                break;
            case 'task-assigned':
                await email_service_1.emailService.sendTaskAssignedEmail(to, data.assignerName, data.taskTitle, data.projectName, data.taskId);
                break;
            case 'task-due':
            case 'mention':
                // Use custom email for these types
                await email_service_1.emailService.sendCustomEmail(to, data.subject || `MacroFlow: ${type}`, data.html || `<p>${data.message}</p>`);
                break;
            default:
                logger_1.logger.warn(`Unknown email type: ${type}`);
        }
        logger_1.logger.info(`Email job completed: ${type}`, { jobId: job.id });
    }
    catch (error) {
        logger_1.logger.error(`Email job failed: ${type}`, { jobId: job.id, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 5,
});
exports.emailWorker = emailWorker;
// Notification worker
const notificationWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.NOTIFICATIONS, async (job) => {
    const { userId, type, title, message, data, sendEmail } = job.data;
    logger_1.logger.info(`Processing notification job`, { jobId: job.id, userId, type });
    try {
        // Create in-app notification
        await notification_service_1.notificationService.create(userId, type, title, message, data);
        // Optionally send email notification
        if (sendEmail) {
            const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
            if (user && user.email) {
                await email_service_1.emailService.sendCustomEmail(user.email, title, `<p>${message}</p>`);
            }
        }
        logger_1.logger.info(`Notification job completed`, { jobId: job.id });
    }
    catch (error) {
        logger_1.logger.error(`Notification job failed`, { jobId: job.id, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 10,
});
exports.notificationWorker = notificationWorker;
// Activity log worker
const activityLogWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.ACTIVITY_LOG, async (job) => {
    const { action, entityType, entityId, userId, workspaceId, projectId, metadata } = job.data;
    logger_1.logger.info(`Processing activity log job`, { jobId: job.id, action, entityType });
    try {
        await activity_service_1.activityService.log({
            action,
            entityType,
            entityId,
            userId,
            workspaceId,
            projectId,
            metadata,
        });
        logger_1.logger.info(`Activity log job completed`, { jobId: job.id });
    }
    catch (error) {
        logger_1.logger.error(`Activity log job failed`, { jobId: job.id, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 20,
});
exports.activityLogWorker = activityLogWorker;
// File cleanup worker
const fileCleanupWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.FILE_CLEANUP, async (job) => {
    const { keys, reason } = job.data;
    logger_1.logger.info(`Processing file cleanup job`, { jobId: job.id, fileCount: keys.length, reason });
    try {
        await upload_service_1.uploadService.deleteFiles(keys);
        logger_1.logger.info(`File cleanup job completed`, { jobId: job.id });
    }
    catch (error) {
        logger_1.logger.error(`File cleanup job failed`, { jobId: job.id, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 3,
});
exports.fileCleanupWorker = fileCleanupWorker;
// Simulation worker
const simulationWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.SIMULATION, async (job) => {
    const { scenarioId, userId, parameters } = job.data;
    logger_1.logger.info(`Processing simulation job`, { jobId: job.id, scenarioId });
    try {
        // Get scenario
        const scenario = await database_1.prisma.scenario.findUnique({
            where: { id: scenarioId },
        });
        if (!scenario) {
            throw new Error('Scenario not found');
        }
        // Run simulation using the simulation service
        const results = simulation_service_1.simulationService.simulate({
            fiscalPolicy: parameters.fiscalPolicy || scenario.fiscalPolicy,
            monetaryPolicy: parameters.monetaryPolicy || scenario.monetaryPolicy,
            externalSector: parameters.externalSector || scenario.externalSector,
        });
        // Update scenario with results
        await database_1.prisma.scenario.update({
            where: { id: scenarioId },
            data: {
                results: results,
                indicators: results.indicators,
            },
        });
        // Notify user
        await notification_service_1.notificationService.create(userId, 'system', 'Simulation Complete', `Your economic simulation "${scenario.name}" has completed successfully.`, { scenarioId });
        logger_1.logger.info(`Simulation job completed`, { jobId: job.id, scenarioId });
    }
    catch (error) {
        logger_1.logger.error(`Simulation job failed`, { jobId: job.id, scenarioId, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 2, // Limit concurrency for heavy computations
});
exports.simulationWorker = simulationWorker;
// Analytics worker
const analyticsWorker = new bullmq_1.Worker(queue_1.QUEUE_NAMES.ANALYTICS, async (job) => {
    const { type, entityId, action, metadata } = job.data;
    logger_1.logger.info(`Processing analytics job`, { jobId: job.id, type, action });
    try {
        // Store analytics data as activity
        await activity_service_1.activityService.log({
            action: `analytics:${action}`,
            entityType: type,
            entityId,
            userId: metadata?.userId || 'system',
            metadata: metadata || {},
        });
        logger_1.logger.info(`Analytics job completed`, { jobId: job.id });
    }
    catch (error) {
        logger_1.logger.error(`Analytics job failed`, { jobId: job.id, error });
        throw error;
    }
}, {
    connection: queue_1.redisConnection,
    concurrency: 10,
});
exports.analyticsWorker = analyticsWorker;
// Worker error handlers
const workers = [
    emailWorker,
    notificationWorker,
    activityLogWorker,
    fileCleanupWorker,
    simulationWorker,
    analyticsWorker,
];
workers.forEach((worker) => {
    worker.on('error', (error) => {
        logger_1.logger.error(`Worker error: ${worker.name}`, { error });
    });
    worker.on('failed', (job, error) => {
        logger_1.logger.error(`Job failed: ${worker.name}`, {
            jobId: job?.id,
            error: error.message,
        });
    });
    worker.on('completed', (job) => {
        logger_1.logger.debug(`Job completed: ${worker.name}`, { jobId: job.id });
    });
});
// Graceful shutdown
const closeWorkers = async () => {
    logger_1.logger.info('Closing workers...');
    await Promise.all(workers.map((worker) => worker.close()));
    logger_1.logger.info('All workers closed');
};
exports.closeWorkers = closeWorkers;
// Start all workers
const startWorkers = () => {
    logger_1.logger.info('Starting job workers...');
    workers.forEach((worker) => {
        logger_1.logger.info(`Worker started: ${worker.name}`);
    });
};
exports.startWorkers = startWorkers;
//# sourceMappingURL=workers.js.map