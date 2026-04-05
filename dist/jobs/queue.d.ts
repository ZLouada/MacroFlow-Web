import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
export declare const redisConnection: ConnectionOptions | null;
export declare const QUEUE_NAMES: {
    readonly EMAIL: "email-queue";
    readonly NOTIFICATIONS: "notifications-queue";
    readonly ACTIVITY_LOG: "activity-log-queue";
    readonly FILE_CLEANUP: "file-cleanup-queue";
    readonly SIMULATION: "simulation-queue";
    readonly ANALYTICS: "analytics-queue";
};
export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];
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
export declare const emailQueue: Queue<EmailJobData, any, string, EmailJobData, any, string> | null;
export declare const notificationQueue: Queue<NotificationJobData, any, string, NotificationJobData, any, string> | null;
export declare const activityLogQueue: Queue<ActivityLogJobData, any, string, ActivityLogJobData, any, string> | null;
export declare const fileCleanupQueue: Queue<FileCleanupJobData, any, string, FileCleanupJobData, any, string> | null;
export declare const simulationQueue: Queue<SimulationJobData, any, string, SimulationJobData, any, string> | null;
export declare const analyticsQueue: Queue<AnalyticsJobData, any, string, AnalyticsJobData, any, string> | null;
export declare const createQueueEvents: (queueName: string) => QueueEvents | null;
export declare const addEmailJob: (data: EmailJobData, priority?: number) => Promise<import("bullmq").Job<EmailJobData, any, string> | null>;
export declare const addNotificationJob: (data: NotificationJobData, delay?: number) => Promise<import("bullmq").Job<NotificationJobData, any, string> | null>;
export declare const addActivityLogJob: (data: ActivityLogJobData) => Promise<import("bullmq").Job<ActivityLogJobData, any, string> | null>;
export declare const addFileCleanupJob: (data: FileCleanupJobData, delay?: number) => Promise<import("bullmq").Job<FileCleanupJobData, any, string> | null>;
export declare const addSimulationJob: (data: SimulationJobData) => Promise<import("bullmq").Job<SimulationJobData, any, string> | null>;
export declare const addAnalyticsJob: (data: AnalyticsJobData) => Promise<import("bullmq").Job<AnalyticsJobData, any, string> | null>;
export declare const closeQueues: () => Promise<void>;
export declare const getQueueHealth: () => Promise<({
    name: "email-queue" | "notifications-queue" | "activity-log-queue" | "file-cleanup-queue" | "simulation-queue" | "analytics-queue";
    status: string;
    waiting?: undefined;
    active?: undefined;
    completed?: undefined;
    failed?: undefined;
    error?: undefined;
} | {
    name: "email-queue" | "notifications-queue" | "activity-log-queue" | "file-cleanup-queue" | "simulation-queue" | "analytics-queue";
    status: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    error?: undefined;
} | {
    name: "email-queue" | "notifications-queue" | "activity-log-queue" | "file-cleanup-queue" | "simulation-queue" | "analytics-queue";
    status: string;
    error: string;
    waiting?: undefined;
    active?: undefined;
    completed?: undefined;
    failed?: undefined;
})[] | {
    status: string;
    message: string;
}>;
//# sourceMappingURL=queue.d.ts.map