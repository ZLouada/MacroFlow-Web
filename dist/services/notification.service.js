"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../types/index.js");
const socket_service_js_1 = require("./socket.service.js");
// ===========================================
// Notification Service
// ===========================================
exports.notificationService = {
    // Create notification
    async create(userId, type, title, message, data) {
        const notification = await database_js_1.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
            },
        });
        // Send real-time notification
        try {
            const socketService = (0, socket_service_js_1.getSocketService)();
            socketService.sendToUser(userId, 'notification:new', notification);
        }
        catch {
            // Socket not initialized yet
        }
        return notification;
    },
    // Notify task assigned
    async notifyTaskAssigned(taskId, assigneeId, assignerId) {
        const [task, assigner] = await Promise.all([
            database_js_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_js_1.prisma.user.findUnique({
                where: { id: assignerId },
                select: { name: true },
            }),
        ]);
        if (!task || !assigner)
            return;
        await this.create(assigneeId, index_js_1.NotificationType.TASK_ASSIGNED, 'New Task Assigned', `${assigner.name} assigned you to "${task.title}"`, {
            taskId,
            projectId: task.projectId,
            projectName: task.project.name,
        });
    },
    // Notify task completed
    async notifyTaskCompleted(taskId) {
        const task = await database_js_1.prisma.task.findUnique({
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
            await this.create(task.createdBy, index_js_1.NotificationType.TASK_COMPLETED, 'Task Completed', `"${task.title}" has been completed${task.assignee ? ` by ${task.assignee.name}` : ''}`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
    },
    // Notify task overdue
    async notifyTaskOverdue(taskId) {
        const task = await database_js_1.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
        });
        if (!task || !task.assigneeId)
            return;
        await this.create(task.assigneeId, index_js_1.NotificationType.TASK_OVERDUE, 'Task Overdue', `"${task.title}" is past its due date`, {
            taskId,
            projectId: task.projectId,
            projectName: task.project.name,
            dueDate: task.dueDate,
        });
    },
    // Notify mention
    async notifyMention(userId, mentionedBy, taskId, commentId) {
        const [task, mentioner] = await Promise.all([
            database_js_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_js_1.prisma.user.findUnique({
                where: { id: mentionedBy },
                select: { name: true },
            }),
        ]);
        if (!task || !mentioner)
            return;
        await this.create(userId, index_js_1.NotificationType.MENTION, 'You were mentioned', `${mentioner.name} mentioned you in "${task.title}"`, {
            taskId,
            commentId,
            projectId: task.projectId,
            projectName: task.project.name,
        });
    },
    // Notify comment added
    async notifyCommentAdded(taskId, commenterId) {
        const [task, commenter] = await Promise.all([
            database_js_1.prisma.task.findUnique({
                where: { id: taskId },
                include: { project: true },
            }),
            database_js_1.prisma.user.findUnique({
                where: { id: commenterId },
                select: { name: true },
            }),
        ]);
        if (!task || !commenter)
            return;
        // Notify assignee if different from commenter
        if (task.assigneeId && task.assigneeId !== commenterId) {
            await this.create(task.assigneeId, index_js_1.NotificationType.COMMENT_ADDED, 'New Comment', `${commenter.name} commented on "${task.title}"`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
        // Notify creator if different from commenter and assignee
        if (task.createdBy !== commenterId && task.createdBy !== task.assigneeId) {
            await this.create(task.createdBy, index_js_1.NotificationType.COMMENT_ADDED, 'New Comment', `${commenter.name} commented on "${task.title}"`, {
                taskId,
                projectId: task.projectId,
                projectName: task.project.name,
            });
        }
    },
    // Get user notifications
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            database_js_1.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_js_1.prisma.notification.count({ where: { userId } }),
            database_js_1.prisma.notification.count({ where: { userId, read: false } }),
        ]);
        return {
            data: notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    },
    // Mark as read
    async markAsRead(notificationId, userId) {
        await database_js_1.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { read: true },
        });
    },
    // Mark all as read
    async markAllAsRead(userId) {
        await database_js_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    },
    // Delete notification
    async delete(notificationId, userId) {
        await database_js_1.prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    },
};
exports.default = exports.notificationService;
//# sourceMappingURL=notification.service.js.map