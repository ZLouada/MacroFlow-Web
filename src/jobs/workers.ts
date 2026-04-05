import { Worker, Job } from 'bullmq';
import {
  redisConnection,
  QUEUE_NAMES,
  EmailJobData,
  NotificationJobData,
  ActivityLogJobData,
  FileCleanupJobData,
  SimulationJobData,
  AnalyticsJobData,
} from './queue.js';
import { logger } from '../utils/logger.js';
import { emailService } from '../services/email.service.js';
import { notificationService } from '../services/notification.service.js';
import { activityService } from '../services/activity.service.js';
import { uploadService } from '../services/upload.service.js';
import { simulationService } from '../services/simulation.service.js';
import { prisma } from '../config/database.js';
import { NotificationType } from '@prisma/client';

// Email worker
const emailWorker = new Worker<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobData>) => {
    const { type, to, data } = job.data;
    logger.info(`Processing email job: ${type}`, { jobId: job.id, to });

    try {
      switch (type) {
        case 'welcome':
        case 'email-verification':
          await emailService.sendVerificationEmail(to, data.name, data.token);
          break;
        case 'password-reset':
          await emailService.sendPasswordResetEmail(to, data.name, data.resetToken);
          break;
        case 'workspace-invitation':
          await emailService.sendWorkspaceInviteEmail(
            to,
            data.inviterName,
            data.workspaceName,
            data.workspaceId
          );
          break;
        case 'task-assigned':
          await emailService.sendTaskAssignedEmail(
            to,
            data.assignerName,
            data.taskTitle,
            data.projectName,
            data.taskId
          );
          break;
        case 'task-due':
        case 'mention':
          // Use custom email for these types
          await emailService.sendCustomEmail(
            to,
            data.subject || `MacroFlow: ${type}`,
            data.html || `<p>${data.message}</p>`
          );
          break;
        default:
          logger.warn(`Unknown email type: ${type}`);
      }
      logger.info(`Email job completed: ${type}`, { jobId: job.id });
    } catch (error) {
      logger.error(`Email job failed: ${type}`, { jobId: job.id, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Notification worker
const notificationWorker = new Worker<NotificationJobData>(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job: Job<NotificationJobData>) => {
    const { userId, type, title, message, data, sendEmail } = job.data;
    logger.info(`Processing notification job`, { jobId: job.id, userId, type });

    try {
      // Create in-app notification
      await notificationService.create(
        userId,
        type as NotificationType,
        title,
        message,
        data
      );

      // Optionally send email notification
      if (sendEmail) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.email) {
          await emailService.sendCustomEmail(
            user.email,
            title,
            `<p>${message}</p>`
          );
        }
      }

      logger.info(`Notification job completed`, { jobId: job.id });
    } catch (error) {
      logger.error(`Notification job failed`, { jobId: job.id, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

// Activity log worker
const activityLogWorker = new Worker<ActivityLogJobData>(
  QUEUE_NAMES.ACTIVITY_LOG,
  async (job: Job<ActivityLogJobData>) => {
    const { action, entityType, entityId, userId, workspaceId, projectId, metadata } = job.data;
    logger.info(`Processing activity log job`, { jobId: job.id, action, entityType });

    try {
      await activityService.log({
        action,
        entityType,
        entityId,
        userId,
        workspaceId,
        projectId,
        metadata,
      });

      logger.info(`Activity log job completed`, { jobId: job.id });
    } catch (error) {
      logger.error(`Activity log job failed`, { jobId: job.id, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 20,
  }
);

// File cleanup worker
const fileCleanupWorker = new Worker<FileCleanupJobData>(
  QUEUE_NAMES.FILE_CLEANUP,
  async (job: Job<FileCleanupJobData>) => {
    const { keys, reason } = job.data;
    logger.info(`Processing file cleanup job`, { jobId: job.id, fileCount: keys.length, reason });

    try {
      await uploadService.deleteFiles(keys);
      logger.info(`File cleanup job completed`, { jobId: job.id });
    } catch (error) {
      logger.error(`File cleanup job failed`, { jobId: job.id, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  }
);

// Simulation worker
const simulationWorker = new Worker<SimulationJobData>(
  QUEUE_NAMES.SIMULATION,
  async (job: Job<SimulationJobData>) => {
    const { scenarioId, userId, parameters } = job.data;
    logger.info(`Processing simulation job`, { jobId: job.id, scenarioId });

    try {
      // Get scenario
      const scenario = await prisma.scenario.findUnique({
        where: { id: scenarioId },
      });

      if (!scenario) {
        throw new Error('Scenario not found');
      }

      // Run simulation using the simulation service
      const results = simulationService.simulate({
        fiscalPolicy: parameters.fiscalPolicy || scenario.fiscalPolicy as any,
        monetaryPolicy: parameters.monetaryPolicy || scenario.monetaryPolicy as any,
        externalSector: parameters.externalSector || scenario.externalSector as any,
      });

      // Update scenario with results
      await prisma.scenario.update({
        where: { id: scenarioId },
        data: {
          results: results as any,
          indicators: results.indicators as any,
        },
      });

      // Notify user
      await notificationService.create(
        userId,
        'system' as NotificationType,
        'Simulation Complete',
        `Your economic simulation "${scenario.name}" has completed successfully.`,
        { scenarioId }
      );

      logger.info(`Simulation job completed`, { jobId: job.id, scenarioId });
    } catch (error) {
      logger.error(`Simulation job failed`, { jobId: job.id, scenarioId, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Limit concurrency for heavy computations
  }
);

// Analytics worker
const analyticsWorker = new Worker<AnalyticsJobData>(
  QUEUE_NAMES.ANALYTICS,
  async (job: Job<AnalyticsJobData>) => {
    const { type, entityId, action, metadata } = job.data;
    logger.info(`Processing analytics job`, { jobId: job.id, type, action });

    try {
      // Store analytics data as activity
      await activityService.log({
        action: `analytics:${action}`,
        entityType: type,
        entityId,
        userId: metadata?.userId as string || 'system',
        metadata: metadata || {},
      });

      logger.info(`Analytics job completed`, { jobId: job.id });
    } catch (error) {
      logger.error(`Analytics job failed`, { jobId: job.id, error });
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

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
  worker.on('error', (error: Error) => {
    logger.error(`Worker error: ${worker.name}`, { error });
  });

  worker.on('failed', (job: Job | undefined, error: Error) => {
    logger.error(`Job failed: ${worker.name}`, {
      jobId: job?.id,
      error: error.message,
    });
  });

  worker.on('completed', (job: Job) => {
    logger.debug(`Job completed: ${worker.name}`, { jobId: job.id });
  });
});

// Graceful shutdown
export const closeWorkers = async () => {
  logger.info('Closing workers...');
  await Promise.all(workers.map((worker) => worker.close()));
  logger.info('All workers closed');
};

// Start all workers
export const startWorkers = () => {
  logger.info('Starting job workers...');
  workers.forEach((worker) => {
    logger.info(`Worker started: ${worker.name}`);
  });
};

export {
  emailWorker,
  notificationWorker,
  activityLogWorker,
  fileCleanupWorker,
  simulationWorker,
  analyticsWorker,
};
