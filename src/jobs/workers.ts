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
} from './queue';
import { logger } from '../utils/logger';
import { emailService } from '../services/email.service';
import { notificationService } from '../services/notification.service';
import { activityService } from '../services/activity.service';
import { uploadService } from '../services/upload.service';
import { simulationService } from '../services/simulation.service';
import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';

// Workers (only created if Redis is configured)
let emailWorker: Worker<EmailJobData> | null = null;
let notificationWorker: Worker<NotificationJobData> | null = null;
let activityLogWorker: Worker<ActivityLogJobData> | null = null;
let fileCleanupWorker: Worker<FileCleanupJobData> | null = null;
let simulationWorker: Worker<SimulationJobData> | null = null;
let analyticsWorker: Worker<AnalyticsJobData> | null = null;

// Only initialize workers if Redis is configured
if (redisConnection) {
  // Email worker
  emailWorker = new Worker<EmailJobData>(
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
  notificationWorker = new Worker<NotificationJobData>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job: Job<NotificationJobData>) => {
      const { userId, type, title, message, data, sendEmail } = job.data;
      logger.info(`Processing notification job`, { jobId: job.id, userId, type });

      try {
        await notificationService.create(
          userId,
          type as NotificationType,
          title,
          message,
          data
        );

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
  activityLogWorker = new Worker<ActivityLogJobData>(
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
  fileCleanupWorker = new Worker<FileCleanupJobData>(
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
  simulationWorker = new Worker<SimulationJobData>(
    QUEUE_NAMES.SIMULATION,
    async (job: Job<SimulationJobData>) => {
      const { scenarioId, userId, parameters } = job.data;
      logger.info(`Processing simulation job`, { jobId: job.id, scenarioId });

      try {
        const scenario = await prisma.scenario.findUnique({
          where: { id: scenarioId },
        });

        if (!scenario) {
          throw new Error('Scenario not found');
        }

        const results = simulationService.simulate({
          fiscalPolicy: parameters.fiscalPolicy || scenario.fiscalPolicy as any,
          monetaryPolicy: parameters.monetaryPolicy || scenario.monetaryPolicy as any,
          externalSector: parameters.externalSector || scenario.externalSector as any,
        });

        await prisma.scenario.update({
          where: { id: scenarioId },
          data: {
            results: results as any,
            indicators: results.indicators as any,
          },
        });

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
      concurrency: 2,
    }
  );

  // Analytics worker
  analyticsWorker = new Worker<AnalyticsJobData>(
    QUEUE_NAMES.ANALYTICS,
    async (job: Job<AnalyticsJobData>) => {
      const { type, entityId, action, metadata } = job.data;
      logger.info(`Processing analytics job`, { jobId: job.id, type, action });

      try {
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
    if (!worker) return;
    
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
} else {
  logger.info('Redis not configured - background job workers disabled');
}

// Graceful shutdown
export const closeWorkers = async () => {
  if (!redisConnection) {
    logger.info('No workers to close (Redis not configured)');
    return;
  }
  
  logger.info('Closing workers...');
  const workers = [
    emailWorker,
    notificationWorker,
    activityLogWorker,
    fileCleanupWorker,
    simulationWorker,
    analyticsWorker,
  ];
  await Promise.all(workers.filter(w => w !== null).map(w => w!.close()));
  logger.info('All workers closed');
};

// Start all workers
export const startWorkers = () => {
  if (!redisConnection) {
    logger.info('Redis not configured - workers not started');
    return;
  }
  
  logger.info('Starting job workers...');
  const workers = [
    emailWorker,
    notificationWorker,
    activityLogWorker,
    fileCleanupWorker,
    simulationWorker,
    analyticsWorker,
  ];
  workers.forEach((worker) => {
    if (worker) {
      logger.info(`Worker started: ${worker.name}`);
    }
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
