"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_1 = require("../config/database");
const client_1 = require("@prisma/client");
const socket_service_1 = require("./socket.service");
const redis_1 = require("../config/redis");
const errors_1 = require("../utils/errors");
exports.notificationService = {
    // Create notification
    async create(userId, type, title, message, data) {
        const notification = await database_1.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data,
            },
        });
        // Send real-time notification
        try {
            const socketService = (0, socket_service_1.getSocketService)();
            socketService.sendToUser(userId, 'notification:new', notification);
        }
        catch {
            // Socket not initialized yet
        }
        return notification;
    },
    // Get user notifications with cursor pagination
    async getUserNotifications(userId, params = {}) {
        const { cursor, limit = 20, unreadOnly = false, type } = params;
        const where = {
            userId,
            ...(unreadOnly && { read: false }),
            ...(type && { type: type }),
        };
        const notifications = await database_1.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
        });
        const hasNext = notifications.length > limit;
        if (hasNext)
            notifications.pop();
        const nextCursor = hasNext ? notifications[notifications.length - 1]?.id : undefined;
        return {
            data: notifications,
            pagination: {
                hasNext,
                nextCursor,
                limit,
            },
        };
    },
    // Get notification by ID
    async getNotificationById(notificationId, userId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        return notification;
    },
    // Get unread count
    async getUnreadCount(userId) {
        return database_1.prisma.notification.count({
            where: { userId, read: false },
        });
    },
    // Mark as read
    async markAsRead(notificationId, userId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        return database_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    },
    // Mark as unread
    async markAsUnread(notificationId, userId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        return database_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: false },
        });
    },
    // Mark all as read
    async markAllAsRead(userId) {
        const result = await database_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return result.count;
    },
    // Delete notification
    async deleteNotification(notificationId, userId) {
        const notification = await database_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found');
        }
        await database_1.prisma.notification.delete({
            where: { id: notificationId },
        });
    },
    // Delete all notifications
    async deleteAllNotifications(userId, readOnly = false) {
        const result = await database_1.prisma.notification.deleteMany({
            where: {
                userId,
                ...(readOnly && { read: true }),
            },
        });
        return result.count;
    },
    // Bulk mark as read
    async bulkMarkAsRead(userId, notificationIds) {
        const result = await database_1.prisma.notification.updateMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
            data: { read: true },
        });
        return result.count;
    },
    // Bulk delete notifications
    async bulkDeleteNotifications(userId, notificationIds) {
        const result = await database_1.prisma.notification.deleteMany({
            where: {
                id: { in: notificationIds },
                userId,
            },
        });
        return result.count;
    },
    // Get notification preferences (stored in Redis or User model)
    async getNotificationPreferences(userId) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `notification:preferences:${userId}`;
            const cached = await redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch {
            // Redis not available
        }
        // Default preferences
        return {
            email: true,
            push: true,
            inApp: true,
            taskAssigned: true,
            taskCompleted: true,
            taskOverdue: true,
            commentAdded: true,
            mention: true,
            workspaceInvite: true,
            projectUpdate: true,
        };
    },
    // Update notification preferences
    async updateNotificationPreferences(userId, preferences) {
        const current = await this.getNotificationPreferences(userId);
        const updated = { ...current, ...preferences };
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `notification:preferences:${userId}`;
            await redis.set(key, JSON.stringify(updated));
        }
        catch {
            // Redis not available
        }
        return updated;
    },
    // Subscribe to push notifications
    async subscribeToPushNotifications(userId, subscription) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `push:subscriptions:${userId}`;
            // Get existing subscriptions
            const existing = await redis.get(key);
            const subscriptions = existing ? JSON.parse(existing) : [];
            // Check if already subscribed
            const alreadySubscribed = subscriptions.some(s => s.endpoint === subscription.endpoint);
            if (!alreadySubscribed) {
                subscriptions.push(subscription);
                await redis.set(key, JSON.stringify(subscriptions));
            }
        }
        catch {
            // Redis not available - could store in database instead
        }
    },
    // Unsubscribe from push notifications
    async unsubscribeFromPushNotifications(userId, endpoint) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `push:subscriptions:${userId}`;
            const existing = await redis.get(key);
            if (existing) {
                const subscriptions = JSON.parse(existing);
                const filtered = subscriptions.filter(s => s.endpoint !== endpoint);
                await redis.set(key, JSON.stringify(filtered));
            }
        }
        catch {
            // Redis not available
        }
    },
    // ===========================================
    // Helper methods for other services
    // ===========================================
    // Notify task assigned
    async notifyTaskAssigned(taskId, assigneeId, assignerId) {
        const [task, assigner] = await Promise.all([
            database_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_1.prisma.user.findUnique({
                where: { id: assignerId },
                select: { name: true },
            }),
        ]);
        if (!task || !assigner)
            return;
        await this.create(assigneeId, client_1.NotificationType.taskAssigned, 'New Task Assigned', `${assigner.name} assigned you to "${task.title}"`, {
            taskId,
            projectId: task.projectId,
            projectName: task.project.name,
        });
    },
    // Notify task completed
    async notifyTaskCompleted(taskId) {
        const task = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
                creator: { select: { id: true, name: true } },
                assignee: { select: { id: true, name: true } },
            },
        });
        if (!task)
            return;
        // Notify task creator if different from assignee
        if (task.createdBy !== task.assigneeId) {
            await this.create(task.createdBy, client_1.NotificationType.taskCompleted, 'Task Completed', `"${task.title}" has been completed${task.assignee ? ` by ${task.assignee.name}` : ''}`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
    },
    // Notify task overdue
    async notifyTaskOverdue(taskId) {
        const task = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task || !task.assigneeId)
            return;
        await this.create(task.assigneeId, client_1.NotificationType.taskOverdue, 'Task Overdue', `"${task.title}" is past its due date`, {
            taskId,
            projectId: task.projectId,
            projectName: task.project.name,
            dueDate: task.dueDate,
        });
    },
    // Notify mention
    async notifyMention(userId, mentionedBy, taskId, commentId) {
        const [task, mentioner] = await Promise.all([
            database_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_1.prisma.user.findUnique({
                where: { id: mentionedBy },
                select: { name: true },
            }),
        ]);
        if (!task || !mentioner)
            return;
        await this.create(userId, client_1.NotificationType.mention, 'You were mentioned', `${mentioner.name} mentioned you in "${task.title}"`, {
            taskId,
            commentId,
            projectId: task.projectId,
            projectName: task.project.name,
        });
    },
    // Notify comment added
    async notifyCommentAdded(taskId, commenterId) {
        const [task, commenter] = await Promise.all([
            database_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_1.prisma.user.findUnique({
                where: { id: commenterId },
                select: { name: true },
            }),
        ]);
        if (!task || !commenter)
            return;
        // Notify assignee if different from commenter
        if (task.assigneeId && task.assigneeId !== commenterId) {
            await this.create(task.assigneeId, client_1.NotificationType.commentAdded, 'New Comment', `${commenter.name} commented on "${task.title}"`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
        // Notify creator if different from commenter and assignee
        if (task.createdBy !== commenterId && task.createdBy !== task.assigneeId) {
            await this.create(task.createdBy, client_1.NotificationType.commentAdded, 'New Comment', `${commenter.name} commented on "${task.title}"`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
    },
    // Notify workspace invite
    async notifyWorkspaceInvite(userId, workspaceId, invitedBy) {
        const [workspace, inviter] = await Promise.all([
            database_1.prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { name: true },
            }),
            database_1.prisma.user.findUnique({
                where: { id: invitedBy },
                select: { name: true },
            }),
        ]);
        if (!workspace || !inviter)
            return;
        await this.create(userId, client_1.NotificationType.workspaceInvited, 'Workspace Invitation', `${inviter.name} invited you to join "${workspace.name}"`, {
            workspaceId,
            workspaceName: workspace.name,
        });
    },
    // Notify project update
    async notifyProjectUpdate(projectId, updatedBy, updateType) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: { user: { select: { id: true } } },
                },
            },
        });
        if (!project)
            return;
        const updater = await database_1.prisma.user.findUnique({
            where: { id: updatedBy },
            select: { name: true },
        });
        if (!updater)
            return;
        // Notify all project members except the one who made the update
        const membersToNotify = project.members.filter(m => m.userId !== updatedBy);
        await Promise.all(membersToNotify.map(member => this.create(member.userId, client_1.NotificationType.projectInvited, 'Project Updated', `${updater.name} ${updateType} "${project.name}"`, {
            projectId,
            projectName: project.name,
            updateType,
        })));
    },
    // Send system notification
    async sendSystemNotification(userId, title, message, data) {
        return this.create(userId, 'system', title, message, data);
    },
};
exports.default = exports.notificationService;
//# sourceMappingURL=notification.service.js.map