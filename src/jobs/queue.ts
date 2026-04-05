import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { config } from '../config/index';
import { logger } from '../utils/logger';

// Check if Redis is configured
const isRedisConfigured = (): boolean => {
  return !!(config.redis.url && config.redis.url !== 'redis://localhost:6379');
};

// Parse Redis URL safely
const parseRedisUrl = (url: string): ConnectionOptions | null => {
  if (!isRedisConfigured()) {
    return null;
  }
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || config.redis.password || undefined,
    };
  } catch {
    return null;
  }
};

// Redis connection options for BullMQ (null if not configured)
export const redisConnection: ConnectionOptions | null = parseRedisUrl(config.redis.url);

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATIONS: 'notifications-queue',
  ACTIVITY_LOG: 'activity-log-queue',
  FILE_CLEANUP: 'file-cleanup-queue',
  SIMULATION: 'simulation-queue',
  ANALYTICS: 'analytics-queue',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

// Job types
export interface EmailJobData {
  type: 'welcome' | 'password-reset' | 'email-verification' | 'workspace-invitation' | 'task-assigned' | 'task-due' | 'mention';
  to: string;
  subject?: string;
  data: Record<string, any>;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  sendPush?: boolean;
  sendEmail?: boolean;
}

export interface ActivityLogJobData {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  metadata?: Record<string, any>;
  changes?: Record<string, any>;
}

export interface FileCleanupJobData {
  keys: string[];
  reason?: string;
}

export interface SimulationJobData {
  scenarioId: string;
  userId: string;
  parameters: Record<string, any>;
}

export interface AnalyticsJobData {
  type: 'workspace' | 'project' | 'user';
  entityId: string;
  action: string;
  metadata?: Record<string, any>;
}

// Create queues only if Redis is configured
const createQueue = <T>(name: string, options: any): Queue<T> | null => {
  if (!redisConnection) {
    return null;
  }
  return new Queue<T>(name, {
    connection: redisConnection,
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
export const emailQueue = createQueue<EmailJobData>(QUEUE_NAMES.EMAIL, defaultEmailOptions);
export const notificationQueue = createQueue<NotificationJobData>(QUEUE_NAMES.NOTIFICATIONS, defaultNotificationOptions);
export const activityLogQueue = createQueue<ActivityLogJobData>(QUEUE_NAMES.ACTIVITY_LOG, defaultActivityOptions);
export const fileCleanupQueue = createQueue<FileCleanupJobData>(QUEUE_NAMES.FILE_CLEANUP, defaultFileCleanupOptions);
export const simulationQueue = createQueue<SimulationJobData>(QUEUE_NAMES.SIMULATION, defaultSimulationOptions);
export const analyticsQueue = createQueue<AnalyticsJobData>(QUEUE_NAMES.ANALYTICS, defaultAnalyticsOptions);

// Queue events for monitoring
export const createQueueEvents = (queueName: string): QueueEvents | null => {
  if (!redisConnection) {
    return null;
  }
  const events = new QueueEvents(queueName, { connection: redisConnection });

  events.on('completed', ({ jobId }) => {
    logger.debug(`Job ${jobId} completed in ${queueName}`);
  });

  events.on('failed', ({ jobId, failedReason }) => {
    logger.error(`Job ${jobId} failed in ${queueName}`, { reason: failedReason });
  });

  events.on('stalled', ({ jobId }) => {
    logger.warn(`Job ${jobId} stalled in ${queueName}`);
  });

  return events;
};

// Helper functions for adding jobs (no-op if Redis not configured)
export const addEmailJob = async (data: EmailJobData, priority?: number) => {
  if (!emailQueue) {
    logger.debug('Redis not configured, skipping email job', { type: data.type });
    return null;
  }
  return emailQueue.add('send-email', data, { priority });
};

export const addNotificationJob = async (data: NotificationJobData, delay?: number) => {
  if (!notificationQueue) {
    logger.debug('Redis not configured, skipping notification job');
    return null;
  }
  return notificationQueue.add('create-notification', data, { delay });
};

export const addActivityLogJob = async (data: ActivityLogJobData) => {
  if (!activityLogQueue) {
    logger.debug('Redis not configured, skipping activity log job');
    return null;
  }
  return activityLogQueue.add('log-activity', data);
};

export const addFileCleanupJob = async (data: FileCleanupJobData, delay?: number) => {
  if (!fileCleanupQueue) {
    logger.debug('Redis not configured, skipping file cleanup job');
    return null;
  }
  return fileCleanupQueue.add('cleanup-files', data, { delay });
};

export const addSimulationJob = async (data: SimulationJobData) => {
  if (!simulationQueue) {
    logger.debug('Redis not configured, skipping simulation job');
    return null;
  }
  return simulationQueue.add('run-simulation', data);
};

export const addAnalyticsJob = async (data: AnalyticsJobData) => {
  if (!analyticsQueue) {
    logger.debug('Redis not configured, skipping analytics job');
    return null;
  }
  return analyticsQueue.add('track-analytics', data);
};

// Graceful shutdown
export const closeQueues = async () => {
  if (!redisConnection) {
    logger.info('No queues to close (Redis not configured)');
    return;
  }
  logger.info('Closing job queues...');
  const queues = [emailQueue, notificationQueue, activityLogQueue, fileCleanupQueue, simulationQueue, analyticsQueue];
  await Promise.all(queues.filter(q => q !== null).map(q => q!.close()));
  logger.info('All queues closed');
};

// Health check for queues
export const getQueueHealth = async () => {
  if (!redisConnection) {
    return { status: 'disabled', message: 'Redis not configured' };
  }

  const queues = [
    { name: QUEUE_NAMES.EMAIL, queue: emailQueue },
    { name: QUEUE_NAMES.NOTIFICATIONS, queue: notificationQueue },
    { name: QUEUE_NAMES.ACTIVITY_LOG, queue: activityLogQueue },
    { name: QUEUE_NAMES.FILE_CLEANUP, queue: fileCleanupQueue },
    { name: QUEUE_NAMES.SIMULATION, queue: simulationQueue },
    { name: QUEUE_NAMES.ANALYTICS, queue: analyticsQueue },
  ];

  const health = await Promise.all(
    queues.map(async ({ name, queue }) => {
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
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          error: (error as Error).message,
        };
      }
    })
  );

  return health;
};
