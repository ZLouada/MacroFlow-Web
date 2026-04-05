import { NotificationType } from '../types/index.js';
export declare const notificationService: {
    create(userId: string, type: NotificationType, title: string, message: string, data?: Record<string, unknown>): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }>;
    notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string): Promise<void>;
    notifyTaskCompleted(taskId: string): Promise<void>;
    notifyTaskOverdue(taskId: string): Promise<void>;
    notifyMention(userId: string, mentionedBy: string, taskId: string, commentId?: string): Promise<void>;
    notifyCommentAdded(taskId: string, commenterId: string): Promise<void>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            id: string;
            userId: string;
            createdAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            read: boolean;
        }[];
        unreadCount: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
};
export default notificationService;
//# sourceMappingURL=notification.service.d.ts.map