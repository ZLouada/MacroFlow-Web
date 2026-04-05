import { Worker } from 'bullmq';
import { EmailJobData, NotificationJobData, ActivityLogJobData, FileCleanupJobData, SimulationJobData, AnalyticsJobData } from './queue.js';
declare const emailWorker: Worker<EmailJobData, any, string>;
declare const notificationWorker: Worker<NotificationJobData, any, string>;
declare const activityLogWorker: Worker<ActivityLogJobData, any, string>;
declare const fileCleanupWorker: Worker<FileCleanupJobData, any, string>;
declare const simulationWorker: Worker<SimulationJobData, any, string>;
declare const analyticsWorker: Worker<AnalyticsJobData, any, string>;
export declare const closeWorkers: () => Promise<void>;
export declare const startWorkers: () => void;
export { emailWorker, notificationWorker, activityLogWorker, fileCleanupWorker, simulationWorker, analyticsWorker, };
//# sourceMappingURL=workers.d.ts.map