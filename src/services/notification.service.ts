import { prisma } from '../config/database';
import { Prisma, NotificationType } from '@prisma/client';
import { getSocketService } from './socket.service';
import { getRedisClient } from '../config/redis';
import { NotFoundError } from '../utils/errors';

// ===========================================
// Notification Service
// ===========================================

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

export const notificationService = {
  // Create notification
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data as Prisma.InputJsonValue,
      },
    });

    // Send real-time notification
    try {
      const socketService = getSocketService();
      socketService.sendToUser(userId, 'notification:new', notification);
    } catch {
      // Socket not initialized yet
    }

    return notification;
  },

  // Get user notifications with cursor pagination
  async getUserNotifications(userId: string, params: GetNotificationsParams = {}) {
    const { cursor, limit = 20, unreadOnly = false, type } = params;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && { read: false }),
      ...(type && { type: type as NotificationType }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasNext = notifications.length > limit;
    if (hasNext) notifications.pop();

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
  async getNotificationById(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },

  // Mark as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  // Mark as unread
  async markAsUnread(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: false },
    });
  },

  // Mark all as read
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return result.count;
  },

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });
  },

  // Delete all notifications
  async deleteAllNotifications(userId: string, readOnly = false): Promise<number> {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        ...(readOnly && { read: true }),
      },
    });

    return result.count;
  },

  // Bulk mark as read
  async bulkMarkAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: { read: true },
    });

    return result.count;
  },

  // Bulk delete notifications
  async bulkDeleteNotifications(userId: string, notificationIds: string[]): Promise<number> {
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
    });

    return result.count;
  },

  // Get notification preferences (stored in Redis or User model)
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const redis = getRedisClient();
      const key = `notification:preferences:${userId}`;
      const cached = await redis.get(key);

      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
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
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = await this.getNotificationPreferences(userId);
    const updated = { ...current, ...preferences };

    try {
      const redis = getRedisClient();
      const key = `notification:preferences:${userId}`;
      await redis.set(key, JSON.stringify(updated));
    } catch {
      // Redis not available
    }

    return updated;
  },

  // Subscribe to push notifications
  async subscribeToPushNotifications(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `push:subscriptions:${userId}`;
      
      // Get existing subscriptions
      const existing = await redis.get(key);
      const subscriptions: PushSubscription[] = existing ? JSON.parse(existing) : [];
      
      // Check if already subscribed
      const alreadySubscribed = subscriptions.some(s => s.endpoint === subscription.endpoint);
      if (!alreadySubscribed) {
        subscriptions.push(subscription);
        await redis.set(key, JSON.stringify(subscriptions));
      }
    } catch {
      // Redis not available - could store in database instead
    }
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPushNotifications(userId: string, endpoint: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `push:subscriptions:${userId}`;
      
      const existing = await redis.get(key);
      if (existing) {
        const subscriptions: PushSubscription[] = JSON.parse(existing);
        const filtered = subscriptions.filter(s => s.endpoint !== endpoint);
        await redis.set(key, JSON.stringify(filtered));
      }
    } catch {
      // Redis not available
    }
  },

  // ===========================================
  // Helper methods for other services
  // ===========================================

  // Notify task assigned
  async notifyTaskAssigned(taskId: string, assigneeId: string, assignerId: string) {
    const [task, assigner] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      }),
      prisma.user.findUnique({
        where: { id: assignerId },
        select: { name: true },
      }),
    ]);

    if (!task || !assigner) return;

    await this.create(
      assigneeId,
      NotificationType.taskAssigned,
      'New Task Assigned',
      `${assigner.name} assigned you to "${task.title}"`,
      {
        taskId,
        projectId: task.projectId,
        projectName: task.project.name,
      }
    );
  },

  // Notify task completed
  async notifyTaskCompleted(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    if (!task) return;

    // Notify task creator if different from assignee
    if (task.createdBy !== task.assigneeId) {
      await this.create(
        task.createdBy,
        NotificationType.taskCompleted,
        'Task Completed',
        `"${task.title}" has been completed${task.assignee ? ` by ${task.assignee.name}` : ''}`,
        {
          taskId,
          projectId: task.projectId,
          projectName: task.project.name,
        }
      );
    }
  },

  // Notify task overdue
  async notifyTaskOverdue(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || !task.assigneeId) return;

    await this.create(
      task.assigneeId,
      NotificationType.taskOverdue,
      'Task Overdue',
      `"${task.title}" is past its due date`,
      {
        taskId,
        projectId: task.projectId,
        projectName: task.project.name,
        dueDate: task.dueDate,
      }
    );
  },

  // Notify mention
  async notifyMention(
    userId: string,
    mentionedBy: string,
    taskId: string,
    commentId?: string
  ) {
    const [task, mentioner] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      }),
      prisma.user.findUnique({
        where: { id: mentionedBy },
        select: { name: true },
      }),
    ]);

    if (!task || !mentioner) return;

    await this.create(
      userId,
      NotificationType.mention,
      'You were mentioned',
      `${mentioner.name} mentioned you in "${task.title}"`,
      {
        taskId,
        commentId,
        projectId: task.projectId,
        projectName: task.project.name,
      }
    );
  },

  // Notify comment added
  async notifyCommentAdded(taskId: string, commenterId: string) {
    const [task, commenter] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      }),
      prisma.user.findUnique({
        where: { id: commenterId },
        select: { name: true },
      }),
    ]);

    if (!task || !commenter) return;

    // Notify assignee if different from commenter
    if (task.assigneeId && task.assigneeId !== commenterId) {
      await this.create(
        task.assigneeId,
        NotificationType.commentAdded,
        'New Comment',
        `${commenter.name} commented on "${task.title}"`,
        {
          taskId,
          projectId: task.projectId,
          projectName: task.project.name,
        }
      );
    }

    // Notify creator if different from commenter and assignee
    if (task.createdBy !== commenterId && task.createdBy !== task.assigneeId) {
      await this.create(
        task.createdBy,
        NotificationType.commentAdded,
        'New Comment',
        `${commenter.name} commented on "${task.title}"`,
        {
          taskId,
          projectId: task.projectId,
          projectName: task.project.name,
        }
      );
    }
  },

  // Notify workspace invite
  async notifyWorkspaceInvite(userId: string, workspaceId: string, invitedBy: string) {
    const [workspace, inviter] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: invitedBy },
        select: { name: true },
      }),
    ]);

    if (!workspace || !inviter) return;

    await this.create(
      userId,
      NotificationType.workspaceInvited,
      'Workspace Invitation',
      `${inviter.name} invited you to join "${workspace.name}"`,
      {
        workspaceId,
        workspaceName: workspace.name,
      }
    );
  },

  // Notify project update
  async notifyProjectUpdate(projectId: string, updatedBy: string, updateType: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: { select: { id: true } } },
        },
      },
    });

    if (!project) return;

    const updater = await prisma.user.findUnique({
      where: { id: updatedBy },
      select: { name: true },
    });

    if (!updater) return;

    // Notify all project members except the one who made the update
    const membersToNotify = project.members.filter(m => m.userId !== updatedBy);

    await Promise.all(
      membersToNotify.map(member =>
        this.create(
          member.userId,
          NotificationType.projectInvited,
          'Project Updated',
          `${updater.name} ${updateType} "${project.name}"`,
          {
            projectId,
            projectName: project.name,
            updateType,
          }
        )
      )
    );
  },

  // Send system notification
  async sendSystemNotification(userId: string, title: string, message: string, data?: Record<string, unknown>) {
    return this.create(userId, 'system' as NotificationType, title, message, data);
  },
};

export default notificationService;
