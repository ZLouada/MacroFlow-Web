import { Queue, Worker, Job, QueueEvents, ConnectionOptions } from 'bullmq';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Parse Redis URL safely
const parseRedisUrl = (url: string): ConnectionOptions => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || config.redis.password || undefined,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
      password: config.redis.password || undefined,
    };
  }
};

// Redis connection options for BullMQ
export const redisConnection: ConnectionOptions = parseRedisUrl(config.redis.url);

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

// Create queues
export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
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

export const notificationQueue = new Queue<NotificationJobData>(QUEUE_NAMES.NOTIFICATIONS, {
  connection: redisConnection,
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

export const activityLogQueue = new Queue<ActivityLogJobData>(QUEUE_NAMES.ACTIVITY_LOG, {
  connection: redisConnection,
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

export const fileCleanupQueue = new Queue<FileCleanupJobData>(QUEUE_NAMES.FILE_CLEANUP, {
  connection: redisConnection,
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

export const simulationQueue = new Queue<SimulationJobData>(QUEUE_NAMES.SIMULATION, {
  connection: redisConnection,
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

export const analyticsQueue = new Queue<AnalyticsJobData>(QUEUE_NAMES.ANALYTICS, {
  connection: redisConnection,
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
export const createQueueEvents = (queueName: string) => {
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

// Helper functions for adding jobs
export const addEmailJob = async (data: EmailJobData, priority?: number) => {
  return emailQueue.add('send-email', data, { priority });
};

export const addNotificationJob = async (data: NotificationJobData, delay?: number) => {
  return notificationQueue.add('create-notification', data, { delay });
};

export const addActivityLogJob = async (data: ActivityLogJobData) => {
  return activityLogQueue.add('log-activity', data);
};

export const addFileCleanupJob = async (data: FileCleanupJobData, delay?: number) => {
  return fileCleanupQueue.add('cleanup-files', data, { delay });
};

export const addSimulationJob = async (data: SimulationJobData) => {
  return simulationQueue.add('run-simulation', data);
};

export const addAnalyticsJob = async (data: AnalyticsJobData) => {
  return analyticsQueue.add('track-analytics', data);
};

// Graceful shutdown
export const closeQueues = async () => {
  logger.info('Closing job queues...');
  await Promise.all([
    emailQueue.close(),
    notificationQueue.close(),
    activityLogQueue.close(),
    fileCleanupQueue.close(),
    simulationQueue.close(),
    analyticsQueue.close(),
  ]);
  logger.info('All queues closed');
};

// Health check for queues
export const getQueueHealth = async () => {
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
