import { Worker } from 'bullmq';
import { EmailJobData, NotificationJobData, ActivityLogJobData, FileCleanupJobData, SimulationJobData, AnalyticsJobData } from './queue';
declare let emailWorker: Worker<EmailJobData> | null;
declare let notificationWorker: Worker<NotificationJobData> | null;
declare let activityLogWorker: Worker<ActivityLogJobData> | null;
declare let fileCleanupWorker: Worker<FileCleanupJobData> | null;
declare let simulationWorker: Worker<SimulationJobData> | null;
declare let analyticsWorker: Worker<AnalyticsJobData> | null;
export declare const closeWorkers: () => Promise<void>;
export declare const startWorkers: () => void;
export { emailWorker, notificationWorker, activityLogWorker, fileCleanupWorker, simulationWorker, analyticsWorker, };
//# sourceMappingURL=workers.d.ts.map