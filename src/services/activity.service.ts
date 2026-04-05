import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';
import { ActivityAction, EntityType } from '../types';

// ===========================================
// Activity Service
// ===========================================

interface LogActivityParams {
  workspaceId?: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  action: ActivityAction | string;
  entityType: EntityType | string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export const activityService = {
  // Log activity
  async log(params: LogActivityParams) {
    const activity = await prisma.activity.create({
      data: {
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        taskId: params.taskId,
        userId: params.userId,
        action: params.action as ActivityAction,
        entityType: params.entityType as EntityType,
        entityId: params.entityId,
        metadata: params.metadata as Prisma.InputJsonValue,
      },
    });

    return activity;
  },

  // Get activity by entity
  async getByEntity(entityType: EntityType, entityId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  },

  // Get activity for task
  async getTaskActivity(taskId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { taskId },
          { entityType: 'task', entityId: taskId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  },

  // Get activity for project
  async getProjectActivity(projectId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  },

  // Get activity for workspace
  async getWorkspaceActivity(workspaceId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  },

  // Get recent activity for user
  async getUserActivity(userId: string, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  },
};

export default activityService;
