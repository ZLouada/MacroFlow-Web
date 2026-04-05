"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityService = void 0;
const database_1 = require("../config/database");
exports.activityService = {
    // Log activity
    async log(params) {
        const activity = await database_1.prisma.activity.create({
            data: {
                workspaceId: params.workspaceId,
                projectId: params.projectId,
                taskId: params.taskId,
                userId: params.userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: params.metadata,
            },
        });
        return activity;
    },
    // Get activity by entity
    async getByEntity(entityType, entityId, limit = 50) {
        const activities = await database_1.prisma.activity.findMany({
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
    async getTaskActivity(taskId, limit = 50) {
        const activities = await database_1.prisma.activity.findMany({
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
    async getProjectActivity(projectId, limit = 50) {
        const activities = await database_1.prisma.activity.findMany({
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
    async getWorkspaceActivity(workspaceId, limit = 50) {
        const activities = await database_1.prisma.activity.findMany({
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
    async getUserActivity(userId, limit = 50) {
        const activities = await database_1.prisma.activity.findMany({
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
exports.default = exports.activityService;
//# sourceMappingURL=activity.service.js.map