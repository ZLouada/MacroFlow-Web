"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
// ===========================================
// Project Service
// ===========================================
exports.projectService = {
    /**
     * Create a new project
     */
    async createProject(workspaceId, userId, data) {
        const project = await database_1.prisma.project.create({
            data: {
                workspaceId,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                createdBy: userId,
                members: {
                    create: {
                        userId,
                        role: 'manager',
                    },
                },
                // Create default columns
                columns: {
                    create: [
                        { title: 'To Do', status: 'todo', order: 0, color: '#6B7280' },
                        { title: 'In Progress', status: 'inProgress', order: 1, color: '#3B82F6' },
                        { title: 'Review', status: 'review', order: 2, color: '#F59E0B' },
                        { title: 'Done', status: 'done', order: 3, color: '#10B981' },
                    ],
                },
            },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
        });
        return project;
    },
    /**
     * Get all projects in a workspace
     */
    async getWorkspaceProjects(workspaceId, options) {
        const limit = options.limit || 20;
        const where = {
            workspaceId,
            deletedAt: null,
            ...(options.status && { status: options.status }),
            ...(options.search && {
                OR: [
                    { name: { contains: options.search, mode: 'insensitive' } },
                    { description: { contains: options.search, mode: 'insensitive' } },
                ],
            }),
        };
        const projects = await database_1.prisma.project.findMany({
            where,
            take: limit + 1,
            ...(options.cursor && {
                cursor: { id: options.cursor },
                skip: 1,
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });
        const hasMore = projects.length > limit;
        const data = hasMore ? projects.slice(0, -1) : projects;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor: hasMore ? data[data.length - 1]?.id : undefined,
            },
        };
    },
    /**
     * Get project by ID
     */
    async getProjectById(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                columns: {
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        return project;
    },
    /**
     * Update project
     */
    async updateProject(projectId, data) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        const updated = await database_1.prisma.project.update({
            where: { id: projectId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
                ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
            },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });
        return updated;
    },
    /**
     * Delete project (soft delete)
     */
    async deleteProject(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        await database_1.prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() },
        });
    },
    /**
     * Get project members with pagination
     */
    async getProjectMembers(projectId, options) {
        const { cursor, limit = 20, role } = options;
        const where = {
            projectId,
            ...(role && { role: role }),
            ...(cursor && {
                joinedAt: { lt: new Date(cursor) },
            }),
        };
        const members = await database_1.prisma.projectMember.findMany({
            where,
            take: limit + 1,
            orderBy: { joinedAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        const hasMore = members.length > limit;
        const data = hasMore ? members.slice(0, -1) : members;
        const nextCursor = hasMore ? data[data.length - 1].joinedAt.toISOString() : null;
        return {
            data: data.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                user: m.user,
            })),
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Add member to project
     */
    async addMember(projectId, userId, role) {
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        // Check if user is a workspace member
        if (project.workspace.members.length === 0) {
            throw new errors_1.ForbiddenError('User must be a workspace member first');
        }
        // Check if already a project member
        const existingMember = await database_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new errors_1.ConflictError('User is already a member of this project');
        }
        const member = await database_1.prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role: role || 'member',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt,
            user: member.user,
        };
    },
    /**
     * Update member role
     */
    async updateMemberRole(projectId, userId, role) {
        const member = await database_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_1.NotFoundError('Member not found');
        }
        const updated = await database_1.prisma.projectMember.update({
            where: { id: member.id },
            data: { role: role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            id: updated.id,
            role: updated.role,
            joinedAt: updated.joinedAt,
            user: updated.user,
        };
    },
    /**
     * Remove member from project
     */
    async removeMember(projectId, userId) {
        const member = await database_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_1.NotFoundError('Member not found');
        }
        await database_1.prisma.projectMember.delete({
            where: { id: member.id },
        });
    },
    /**
     * Get project tasks with filtering and pagination
     */
    async getProjectTasks(projectId, options) {
        const { cursor, limit = 20, status, priority, assigneeId, columnId, labels, search } = options;
        const where = {
            projectId,
            deletedAt: null,
            ...(status && { status: status }),
            ...(priority && { priority: priority }),
            ...(assigneeId && { assigneeId }),
            ...(columnId && { columnId }),
            ...(labels && labels.length > 0 && {
                labels: {
                    some: {
                        labelId: { in: labels },
                    },
                },
            }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const tasks = await database_1.prisma.task.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                column: {
                    select: {
                        id: true,
                        title: true,
                        color: true,
                    },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        attachments: true,
                    },
                },
            },
        });
        const hasMore = tasks.length > limit;
        const data = hasMore ? tasks.slice(0, -1) : tasks;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get project board (Kanban view with columns and tasks)
     */
    async getProjectBoard(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        tasks: {
                            where: { deletedAt: null },
                            orderBy: { order: 'asc' },
                            include: {
                                assignee: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatar: true,
                                    },
                                },
                                labels: {
                                    include: {
                                        label: true,
                                    },
                                },
                                _count: {
                                    select: {
                                        comments: true,
                                        attachments: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        return {
            projectId: project.id,
            projectName: project.name,
            columns: project.columns,
        };
    },
    /**
     * Get project Gantt chart data
     */
    async getProjectGantt(projectId, options) {
        const { startDate, endDate } = options;
        const where = {
            projectId,
            deletedAt: null,
            ...(startDate && endDate && {
                OR: [
                    {
                        startDate: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    },
                    {
                        endDate: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    },
                    {
                        AND: [
                            { startDate: { lte: new Date(startDate) } },
                            { endDate: { gte: new Date(endDate) } },
                        ],
                    },
                ],
            }),
        };
        const tasks = await database_1.prisma.task.findMany({
            where,
            orderBy: [
                { startDate: 'asc' },
                { order: 'asc' },
            ],
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                dependencies: {
                    include: {
                        dependsOn: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            projectId,
            tasks: tasks.map((task) => ({
                id: task.id,
                title: task.title,
                startDate: task.startDate,
                endDate: task.endDate,
                progress: task.progress,
                status: task.status,
                priority: task.priority,
                assignee: task.assignee,
                dependencies: task.dependencies.map((d) => d.dependsOnTaskId),
                isMilestone: task.isMilestone,
            })),
        };
    },
    /**
     * Get project activity
     */
    async getProjectActivity(projectId, options) {
        const { cursor, limit = 20, type } = options;
        const where = {
            projectId,
            ...(type && { action: type }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const activities = await database_1.prisma.activity.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
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
        });
        const hasMore = activities.length > limit;
        const data = hasMore ? activities.slice(0, -1) : activities;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get project labels
     */
    async getProjectLabels(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            select: {
                workspaceId: true,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        // Get workspace labels
        const labels = await database_1.prisma.label.findMany({
            where: {
                workspaceId: project.workspaceId,
            },
            orderBy: { name: 'asc' },
        });
        return labels;
    },
    /**
     * Get project statistics
     */
    async getProjectStats(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        const [memberCount, taskStats, overdueTasks, completedThisWeek] = await Promise.all([
            database_1.prisma.projectMember.count({ where: { projectId } }),
            database_1.prisma.task.groupBy({
                by: ['status'],
                where: { projectId, deletedAt: null },
                _count: true,
            }),
            database_1.prisma.task.count({
                where: {
                    projectId,
                    deletedAt: null,
                    status: { not: 'done' },
                    dueDate: { lt: new Date() },
                },
            }),
            database_1.prisma.task.count({
                where: {
                    projectId,
                    deletedAt: null,
                    status: 'done',
                    updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);
        const tasksByStatus = taskStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count;
            return acc;
        }, {});
        const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
        const completedTasks = tasksByStatus['done'] || 0;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return {
            members: memberCount,
            totalTasks,
            tasksByStatus,
            completionRate,
            overdueTasks,
            completedThisWeek,
        };
    },
    /**
     * Duplicate project
     */
    async duplicateProject(projectId, userId, options) {
        const original = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                columns: true,
                members: true,
                tasks: {
                    where: { deletedAt: null },
                    include: {
                        labels: true,
                    },
                },
            },
        });
        if (!original) {
            throw new errors_1.NotFoundError('Project not found');
        }
        // Create new project
        const newProject = await database_1.prisma.project.create({
            data: {
                workspaceId: original.workspaceId,
                name: options.name || `${original.name} (Copy)`,
                description: original.description,
                color: original.color,
                icon: original.icon,
                createdBy: userId,
                members: {
                    create: options.includeMembers
                        ? original.members.map((m) => ({
                            userId: m.userId,
                            role: m.role,
                        }))
                        : [{
                                userId,
                                role: 'manager',
                            }],
                },
                columns: {
                    create: original.columns.map((col) => ({
                        title: col.title,
                        status: col.status,
                        order: col.order,
                        color: col.color,
                        taskLimit: col.taskLimit,
                    })),
                },
            },
            include: {
                columns: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        // Duplicate tasks if requested
        if (options.includeTasks && original.tasks && original.tasks.length > 0) {
            const columnMap = new Map(original.columns.map((oldCol, index) => [oldCol.id, newProject.columns[index].id]));
            for (const task of original.tasks) {
                await database_1.prisma.task.create({
                    data: {
                        projectId: newProject.id,
                        columnId: columnMap.get(task.columnId) || newProject.columns[0].id,
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        order: task.order,
                        createdBy: userId,
                        labels: {
                            create: task.labels.map((l) => ({
                                labelId: l.labelId,
                            })),
                        },
                    },
                });
            }
        }
        return newProject;
    },
    /**
     * Archive project
     */
    async archiveProject(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        const updated = await database_1.prisma.project.update({
            where: { id: projectId },
            data: { status: 'archived' },
        });
        return updated;
    },
    /**
     * Unarchive project
     */
    async unarchiveProject(projectId) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
                status: 'archived',
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found or not archived');
        }
        const updated = await database_1.prisma.project.update({
            where: { id: projectId },
            data: { status: 'active' },
        });
        return updated;
    },
    /**
     * Update project settings
     */
    async updateProjectSettings(projectId, data) {
        const project = await database_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        // For now, just return the project settings since we don't have a separate settings model
        // In a full implementation, you might have a ProjectSettings model
        return {
            projectId,
            ...data,
        };
    },
};
exports.default = exports.projectService;
//# sourceMappingURL=project.service.js.map