"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const database_js_1 = require("../config/database.js");
// ===========================================
// Dashboard Service
// ===========================================
exports.dashboardService = {
    // Get task summary
    async getTaskSummary(userId, workspaceId) {
        const whereBase = {
            deletedAt: null,
            ...(workspaceId && {
                project: {
                    workspaceId,
                },
            }),
        };
        const [total, byStatus, byPriority, overdue, completed] = await Promise.all([
            database_js_1.prisma.task.count({
                where: { ...whereBase, assigneeId: userId },
            }),
            database_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { ...whereBase, assigneeId: userId },
                _count: { status: true },
            }),
            database_js_1.prisma.task.groupBy({
                by: ['priority'],
                where: { ...whereBase, assigneeId: userId },
                _count: { priority: true },
            }),
            database_js_1.prisma.task.count({
                where: {
                    ...whereBase,
                    assigneeId: userId,
                    dueDate: { lt: new Date() },
                    status: { notIn: ['done'] },
                },
            }),
            database_js_1.prisma.task.count({
                where: {
                    ...whereBase,
                    assigneeId: userId,
                    status: 'done',
                },
            }),
        ]);
        const statusMap = {
            todo: 0,
            inProgress: 0,
            review: 0,
            done: 0,
            blocked: 0,
        };
        byStatus.forEach((s) => {
            statusMap[s.status] = s._count.status;
        });
        const priorityMap = {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0,
        };
        byPriority.forEach((p) => {
            priorityMap[p.priority] = p._count.priority;
        });
        return {
            total,
            byStatus: statusMap,
            byPriority: priorityMap,
            overdue,
            completed,
        };
    },
    // Get my tasks
    async getMyTasks(userId, limit = 20) {
        const tasks = await database_js_1.prisma.task.findMany({
            where: {
                assigneeId: userId,
                deletedAt: null,
                status: { notIn: ['done'] },
            },
            include: {
                project: {
                    select: { id: true, name: true, color: true },
                },
                labels: {
                    include: { label: true },
                },
            },
            orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
            take: limit,
        });
        return tasks.map((t) => ({
            ...t,
            labels: t.labels.map((tl) => tl.label),
        }));
    },
    // Get team velocity (last N weeks)
    async getTeamVelocity(projectId, weeks = 8) {
        const velocity = [];
        const now = new Date();
        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            const completed = await database_js_1.prisma.task.count({
                where: {
                    projectId,
                    status: 'done',
                    updatedAt: {
                        gte: weekStart,
                        lt: weekEnd,
                    },
                },
            });
            const points = await database_js_1.prisma.task.aggregate({
                where: {
                    projectId,
                    status: 'done',
                    updatedAt: {
                        gte: weekStart,
                        lt: weekEnd,
                    },
                },
                _sum: { estimatedHours: true },
            });
            velocity.push({
                period: `Week ${weeks - i}`,
                weekStart: weekStart.toISOString().split('T')[0],
                completed,
                points: points._sum.estimatedHours || 0,
            });
        }
        return velocity;
    },
    // Get burndown data for project
    async getBurndown(projectId, sprintDays = 14) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return [];
        const startDate = project.startDate || project.createdAt;
        const endDate = project.endDate || new Date(startDate.getTime() + sprintDays * 24 * 60 * 60 * 1000);
        const totalTasks = await database_js_1.prisma.task.count({
            where: { projectId, deletedAt: null },
        });
        const burndown = [];
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        const idealBurnRate = totalTasks / days;
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const completedByDate = await database_js_1.prisma.task.count({
                where: {
                    projectId,
                    status: 'done',
                    updatedAt: { lte: date },
                },
            });
            burndown.push({
                date: date.toISOString().split('T')[0],
                planned: Math.max(0, totalTasks - Math.round(idealBurnRate * i)),
                actual: totalTasks - completedByDate,
            });
        }
        return burndown;
    },
    // Get upcoming deadlines
    async getUpcomingDeadlines(userId, days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const tasks = await database_js_1.prisma.task.findMany({
            where: {
                assigneeId: userId,
                deletedAt: null,
                status: { notIn: ['done'] },
                dueDate: {
                    gte: new Date(),
                    lte: futureDate,
                },
            },
            include: {
                project: {
                    select: { id: true, name: true, color: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
        return tasks;
    },
    // Get recent activity
    async getRecentActivity(userId, workspaceId, limit = 50) {
        const activities = await database_js_1.prisma.activity.findMany({
            where: {
                ...(workspaceId && { workspaceId }),
                OR: [
                    { userId },
                    {
                        task: {
                            OR: [{ assigneeId: userId }, { createdBy: userId }],
                        },
                    },
                ],
            },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
                project: {
                    select: { id: true, name: true },
                },
                task: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return activities;
    },
    // Get team workload
    async getTeamWorkload(projectId) {
        const members = await database_js_1.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        const workload = await Promise.all(members.map(async (member) => {
            const [tasksCount, hours] = await Promise.all([
                database_js_1.prisma.task.count({
                    where: {
                        projectId,
                        assigneeId: member.userId,
                        deletedAt: null,
                        status: { notIn: ['done'] },
                    },
                }),
                database_js_1.prisma.task.aggregate({
                    where: {
                        projectId,
                        assigneeId: member.userId,
                        deletedAt: null,
                        status: { notIn: ['done'] },
                    },
                    _sum: {
                        estimatedHours: true,
                        actualHours: true,
                    },
                }),
            ]);
            return {
                userId: member.user.id,
                name: member.user.name,
                avatar: member.user.avatar,
                tasksCount,
                estimatedHours: hours._sum.estimatedHours || 0,
                actualHours: hours._sum.actualHours || 0,
            };
        }));
        return workload;
    },
};
exports.default = exports.dashboardService;
//# sourceMappingURL=dashboard.service.js.map