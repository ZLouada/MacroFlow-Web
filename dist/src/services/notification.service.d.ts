import { Prisma, NotificationType } from '@prisma/client';
interface GetNotificationsParams {
    cursor?: string;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
}
interface NotificationPreferences {
    email: boolean;
    push: boolean;
    inApp: boolean;
    taskAssigned?: boolean;
    taskCompleted?: boolean;
    taskOverdue?: boolean;
    commentAdded?: boolean;
    mention?: boolean;
    workspaceInvite?: boolean;
    projectUpdate?: boolean;
}
interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
export declare const notificationService: {
    create(userId: string, type: NotificationType, title: string, message: string, data?: Record<string, unknown>): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        title: string;
        read: boolean;
    }>;
    getUserNotifications(userId: string, params?: GetNotificationsParams): Promise<{
        data: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            id: string;
            userId: string;
            createdAt: Date;
            data: Prisma.JsonValue | null;
            title: string;
            read: boolean;
        }[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
    }>;
    getNotificationById(notificationId: string, userId: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        title: string;
        read: boolean;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        title: string;
        read: boolean;
    }>;
    markAsUnread(notificationId: string, userId: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        title: string;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllNotifications(userId: string, readOnly?: boolean): Promise<number>;
    bulkMarkAsRead(userId: string, notificationIds: string[]): Promise<number>;
    bulkDeleteNotifications(userId: string, notificationIds: string[]): Promise<number>;
    getNotificationPreferences(userId: string): Promise<NotificationPreferences>;
    updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
    subscribeToPushNotifications(userId: string, subscription: PushSubscription): Promise<void>;
    unsubscribeFromPushNotifications(userId: string, endpoint: string): Promise<void>;
    notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string): Promise<void>;
    notifyTaskCompleted(taskId: string): Promise<void>;
    notifyTaskOverdue(taskId: string): Promise<void>;
    notifyMention(userId: string, mentionedBy: string, taskId: string, commentId?: string): Promise<void>;
    notifyCommentAdded(taskId: string, commenterId: string): Promise<void>;
    notifyWorkspaceInvite(userId: string, workspaceId: string, invitedBy: string): Promise<void>;
    notifyProjectUpdate(projectId: string, updatedBy: string, updateType: string): Promise<void>;
    sendSystemNotification(userId: string, title: string, message: string, data?: Record<string, unknown>): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        title: string;
        read: boolean;
    }>;
};
export default notificationService;
//# sourceMappingURL=notification.service.d.ts.map