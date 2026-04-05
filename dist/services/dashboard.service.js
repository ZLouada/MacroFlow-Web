"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
exports.dashboardService = {
    // Get workspace dashboard
    async getWorkspaceDashboard(workspaceId) {
        const workspace = await database_js_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        const [projects, tasks, members, recentActivity,] = await Promise.all([
            database_js_1.prisma.project.count({
                where: { workspaceId, deletedAt: null },
            }),
            database_js_1.prisma.task.groupBy({
                by: ['status'],
                where: {
                    project: { workspaceId },
                    deletedAt: null,
                },
                _count: { status: true },
            }),
            database_js_1.prisma.workspaceMember.count({
                where: { workspaceId },
            }),
            database_js_1.prisma.activity.findMany({
                where: { workspaceId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
            }),
        ]);
        const tasksByStatus = {
            todo: 0,
            inProgress: 0,
            review: 0,
            done: 0,
            blocked: 0,
        };
        tasks.forEach((t) => {
            tasksByStatus[t.status] = t._count.status;
        });
        const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
        return {
            workspace: {
                id: workspace.id,
                name: workspace.name,
            },
            stats: {
                projects,
                members,
                totalTasks,
                tasksByStatus,
            },
            recentActivity,
        };
    },
    // Get project dashboard
    async getProjectDashboard(projectId) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        const [tasks, columns, members, recentActivity, overdue,] = await Promise.all([
            database_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { projectId, deletedAt: null },
                _count: { status: true },
            }),
            database_js_1.prisma.kanbanColumn.findMany({
                where: { projectId },
                orderBy: { order: 'asc' },
                include: {
                    _count: { select: { tasks: true } },
                },
            }),
            database_js_1.prisma.projectMember.count({ where: { projectId } }),
            database_js_1.prisma.activity.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                    task: { select: { id: true, title: true } },
                },
            }),
            database_js_1.prisma.task.count({
                where: {
                    projectId,
                    deletedAt: null,
                    status: { notIn: ['done'] },
                    dueDate: { lt: new Date() },
                },
            }),
        ]);
        const tasksByStatus = {
            todo: 0,
            inProgress: 0,
            review: 0,
            done: 0,
            blocked: 0,
        };
        tasks.forEach((t) => {
            tasksByStatus[t.status] = t._count.status;
        });
        const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
        return {
            project: {
                id: project.id,
                name: project.name,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate,
            },
            stats: {
                totalTasks,
                tasksByStatus,
                members,
                overdue,
                columns: columns.map((c) => ({
                    id: c.id,
                    title: c.title,
                    tasksCount: c._count.tasks,
                })),
            },
            recentActivity,
        };
    },
    // Get personal dashboard
    async getPersonalDashboard(userId) {
        const [assignedTasks, overdueTasks, upcomingDeadlines, recentActivity, workspaces,] = await Promise.all([
            database_js_1.prisma.task.groupBy({
                by: ['status'],
                where: { assigneeId: userId, deletedAt: null },
                _count: { status: true },
            }),
            database_js_1.prisma.task.findMany({
                where: {
                    assigneeId: userId,
                    deletedAt: null,
                    status: { notIn: ['done'] },
                    dueDate: { lt: new Date() },
                },
                take: 5,
                include: {
                    project: { select: { id: true, name: true, color: true } },
                },
                orderBy: { dueDate: 'asc' },
            }),
            database_js_1.prisma.task.findMany({
                where: {
                    assigneeId: userId,
                    deletedAt: null,
                    status: { notIn: ['done'] },
                    dueDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                take: 5,
                include: {
                    project: { select: { id: true, name: true, color: true } },
                },
                orderBy: { dueDate: 'asc' },
            }),
            database_js_1.prisma.activity.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    project: { select: { id: true, name: true } },
                    task: { select: { id: true, title: true } },
                },
            }),
            database_js_1.prisma.workspaceMember.findMany({
                where: { userId },
                include: {
                    workspace: {
                        select: { id: true, name: true, icon: true },
                    },
                },
            }),
        ]);
        const tasksByStatus = {
            todo: 0,
            inProgress: 0,
            review: 0,
            done: 0,
            blocked: 0,
        };
        assignedTasks.forEach((t) => {
            tasksByStatus[t.status] = t._count.status;
        });
        const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
        return {
            stats: {
                totalTasks,
                tasksByStatus,
                overdue: overdueTasks.length,
            },
            overdueTasks,
            upcomingDeadlines,
            recentActivity,
            workspaces: workspaces.map((w) => w.workspace),
        };
    },
    // Get task summary for workspace with filters
    async getTaskSummary(workspaceId, options = {}) {
        const { projectId, startDate, endDate } = options;
        const where = {
            deletedAt: null,
            project: {
                workspaceId,
                ...(projectId && { id: projectId }),
            },
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [total, byStatus, byPriority, overdue, completed] = await Promise.all([
            database_js_1.prisma.task.count({ where }),
            database_js_1.prisma.task.groupBy({
                by: ['status'],
                where,
                _count: { status: true },
            }),
            database_js_1.prisma.task.groupBy({
                by: ['priority'],
                where,
                _count: { priority: true },
            }),
            database_js_1.prisma.task.count({
                where: {
                    ...where,
                    dueDate: { lt: new Date() },
                    status: { notIn: ['done'] },
                },
            }),
            database_js_1.prisma.task.count({
                where: { ...where, status: 'done' },
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
    // Get velocity metrics
    async getVelocityMetrics(projectId, options) {
        const { period, count } = options;
        const velocity = [];
        const now = new Date();
        const getPeriodDays = () => {
            switch (period) {
                case 'day': return 1;
                case 'week': return 7;
                case 'month': return 30;
                default: return 7;
            }
        };
        const periodDays = getPeriodDays();
        for (let i = count - 1; i >= 0; i--) {
            const periodStart = new Date(now);
            periodStart.setDate(periodStart.getDate() - (i + 1) * periodDays);
            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + periodDays);
            const [completed, points] = await Promise.all([
                database_js_1.prisma.task.count({
                    where: {
                        projectId,
                        status: 'done',
                        updatedAt: {
                            gte: periodStart,
                            lt: periodEnd,
                        },
                    },
                }),
                database_js_1.prisma.task.aggregate({
                    where: {
                        projectId,
                        status: 'done',
                        updatedAt: {
                            gte: periodStart,
                            lt: periodEnd,
                        },
                    },
                    _sum: { estimatedHours: true },
                }),
            ]);
            velocity.push({
                period: `${period.charAt(0).toUpperCase() + period.slice(1)} ${count - i}`,
                startDate: periodStart.toISOString().split('T')[0],
                endDate: periodEnd.toISOString().split('T')[0],
                completed,
                points: points._sum.estimatedHours || 0,
            });
        }
        return velocity;
    },
    // Get burndown chart
    async getBurndownChart(projectId, options = {}) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        const startDate = options.startDate
            ? new Date(options.startDate)
            : project.startDate || project.createdAt;
        const endDate = options.endDate
            ? new Date(options.endDate)
            : project.endDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
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
    // Get workload distribution
    async getWorkloadDistribution(workspaceId, options = {}) {
        const { projectId } = options;
        const members = await database_js_1.prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: { id: true, name: true, avatar: true },
                },
            },
        });
        const workload = await Promise.all(members.map(async (member) => {
            const taskWhere = {
                assigneeId: member.userId,
                deletedAt: null,
                status: { notIn: ['done'] },
                project: {
                    workspaceId,
                    ...(projectId && { id: projectId }),
                },
            };
            const [tasksCount, hours] = await Promise.all([
                database_js_1.prisma.task.count({ where: taskWhere }),
                database_js_1.prisma.task.aggregate({
                    where: taskWhere,
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
    // Get activity timeline
    async getActivityTimeline(workspaceId, options = {}) {
        const { projectId, days = 30 } = options;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const activities = await database_js_1.prisma.activity.findMany({
            where: {
                workspaceId,
                ...(projectId && { projectId }),
                createdAt: { gte: startDate },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
            },
        });
        // Group by date
        const grouped = activities.reduce((acc, activity) => {
            const date = activity.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(activity);
            return acc;
        }, {});
        return Object.entries(grouped).map(([date, items]) => ({
            date,
            activities: items,
        }));
    },
    // Get overdue tasks
    async getOverdueTasks(workspaceId, options = {}) {
        const { cursor, limit = 20, projectId } = options;
        const where = {
            deletedAt: null,
            status: { notIn: ['done'] },
            dueDate: { lt: new Date() },
            project: {
                workspaceId,
                ...(projectId && { id: projectId }),
            },
        };
        if (cursor) {
            where.id = { lt: cursor };
        }
        const tasks = await database_js_1.prisma.task.findMany({
            where,
            take: limit + 1,
            orderBy: { dueDate: 'asc' },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true, color: true } },
            },
        });
        const hasMore = tasks.length > limit;
        if (hasMore)
            tasks.pop();
        return {
            data: tasks,
            pagination: {
                cursor: tasks.length > 0 ? tasks[tasks.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Get upcoming deadlines
    async getUpcomingDeadlines(workspaceId, options = {}) {
        const { cursor, limit = 20, projectId, days = 7 } = options;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        const where = {
            deletedAt: null,
            status: { notIn: ['done'] },
            dueDate: {
                gte: new Date(),
                lte: futureDate,
            },
            project: {
                workspaceId,
                ...(projectId && { id: projectId }),
            },
        };
        if (cursor) {
            where.id = { lt: cursor };
        }
        const tasks = await database_js_1.prisma.task.findMany({
            where,
            take: limit + 1,
            orderBy: { dueDate: 'asc' },
            include: {
                assignee: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true, color: true } },
            },
        });
        const hasMore = tasks.length > limit;
        if (hasMore)
            tasks.pop();
        return {
            data: tasks,
            pagination: {
                cursor: tasks.length > 0 ? tasks[tasks.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Get completion rate
    async getCompletionRate(projectId, options) {
        const { period, count } = options;
        const rates = [];
        const now = new Date();
        const getPeriodDays = () => {
            switch (period) {
                case 'day': return 1;
                case 'week': return 7;
                case 'month': return 30;
                default: return 7;
            }
        };
        const periodDays = getPeriodDays();
        for (let i = count - 1; i >= 0; i--) {
            const periodStart = new Date(now);
            periodStart.setDate(periodStart.getDate() - (i + 1) * periodDays);
            const periodEnd = new Date(periodStart);
            periodEnd.setDate(periodEnd.getDate() + periodDays);
            const [total, completed] = await Promise.all([
                database_js_1.prisma.task.count({
                    where: {
                        projectId,
                        deletedAt: null,
                        createdAt: { lt: periodEnd },
                    },
                }),
                database_js_1.prisma.task.count({
                    where: {
                        projectId,
                        status: 'done',
                        updatedAt: { lt: periodEnd },
                    },
                }),
            ]);
            rates.push({
                period: `${period.charAt(0).toUpperCase() + period.slice(1)} ${count - i}`,
                startDate: periodStart.toISOString().split('T')[0],
                endDate: periodEnd.toISOString().split('T')[0],
                total,
                completed,
                rate: total > 0 ? Math.round((completed / total) * 100) : 0,
            });
        }
        return rates;
    },
    // Get cycle time analysis
    async getCycleTimeAnalysis(projectId, options = {}) {
        const { startDate, endDate } = options;
        const where = {
            projectId,
            status: 'done',
            deletedAt: null,
        };
        if (startDate || endDate) {
            where.updatedAt = {};
            if (startDate)
                where.updatedAt.gte = new Date(startDate);
            if (endDate)
                where.updatedAt.lte = new Date(endDate);
        }
        const completedTasks = await database_js_1.prisma.task.findMany({
            where,
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                priority: true,
            },
        });
        const cycleTimes = completedTasks.map((task) => {
            const cycleTime = (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return {
                taskId: task.id,
                priority: task.priority,
                cycleTimeDays: Math.round(cycleTime * 10) / 10,
            };
        });
        const avgCycleTime = cycleTimes.length > 0
            ? cycleTimes.reduce((sum, t) => sum + t.cycleTimeDays, 0) / cycleTimes.length
            : 0;
        const byPriority = ['low', 'medium', 'high', 'urgent'].map((priority) => {
            const tasks = cycleTimes.filter((t) => t.priority === priority);
            const avg = tasks.length > 0
                ? tasks.reduce((sum, t) => sum + t.cycleTimeDays, 0) / tasks.length
                : 0;
            return {
                priority,
                count: tasks.length,
                avgCycleTimeDays: Math.round(avg * 10) / 10,
            };
        });
        return {
            totalCompleted: completedTasks.length,
            avgCycleTimeDays: Math.round(avgCycleTime * 10) / 10,
            byPriority,
        };
    },
    // Get label stats
    async getLabelStats(projectId) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        const labels = await database_js_1.prisma.label.findMany({
            where: { workspaceId: project.workspaceId },
            include: {
                tasks: {
                    where: {
                        task: {
                            projectId,
                            deletedAt: null,
                        },
                    },
                    include: {
                        task: {
                            select: { status: true },
                        },
                    },
                },
            },
        });
        return labels.map((label) => {
            const taskStatuses = label.tasks.map((tl) => tl.task.status);
            const completed = taskStatuses.filter((s) => s === 'done').length;
            return {
                id: label.id,
                name: label.name,
                color: label.color,
                tasksCount: label.tasks.length,
                completedCount: completed,
                completionRate: label.tasks.length > 0
                    ? Math.round((completed / label.tasks.length) * 100)
                    : 0,
            };
        });
    },
    // Export analytics report
    async exportAnalyticsReport(workspaceId, options) {
        const { projectId, format, startDate, endDate } = options;
        const [summary, workload] = await Promise.all([
            this.getTaskSummary(workspaceId, { projectId, startDate, endDate }),
            this.getWorkloadDistribution(workspaceId, { projectId }),
        ]);
        const data = {
            generatedAt: new Date().toISOString(),
            workspaceId,
            projectId,
            dateRange: { startDate, endDate },
            summary,
            workload,
        };
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }
        if (format === 'csv') {
            const csvRows = [
                'Metric,Value',
                `Total Tasks,${summary.total}`,
                `Completed,${summary.completed}`,
                `Overdue,${summary.overdue}`,
                '',
                'Status,Count',
                ...Object.entries(summary.byStatus).map(([k, v]) => `${k},${v}`),
                '',
                'Priority,Count',
                ...Object.entries(summary.byPriority).map(([k, v]) => `${k},${v}`),
                '',
                'Team Member,Tasks,Estimated Hours,Actual Hours',
                ...workload.map((w) => `${w.name},${w.tasksCount},${w.estimatedHours},${w.actualHours}`),
            ];
            return csvRows.join('\n');
        }
        // PDF format - return JSON for now (PDF generation would require additional library)
        return JSON.stringify(data, null, 2);
    },
    // Legacy methods for backwards compatibility
    async getMyTasks(userId, limit = 20) {
        const tasks = await database_js_1.prisma.task.findMany({
            where: {
                assigneeId: userId,
                deletedAt: null,
                status: { notIn: ['done'] },
            },
            include: {
                project: { select: { id: true, name: true, color: true } },
                labels: { include: { label: true } },
            },
            orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
            take: limit,
        });
        return tasks.map((t) => ({
            ...t,
            labels: t.labels.map((tl) => tl.label),
        }));
    },
    async getTeamVelocity(projectId, weeks = 8) {
        return this.getVelocityMetrics(projectId, { period: 'week', count: weeks });
    },
    async getBurndown(projectId, sprintDays = 14) {
        return this.getBurndownChart(projectId);
    },
    async getTeamWorkload(projectId) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return [];
        return this.getWorkloadDistribution(project.workspaceId, { projectId });
    },
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
                user: { select: { id: true, name: true, avatar: true } },
                project: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return activities;
    },
};
exports.default = exports.dashboardService;
//# sourceMappingURL=dashboard.service.js.map