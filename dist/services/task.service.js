"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const activity_service_js_1 = require("./activity.service.js");
const notification_service_js_1 = require("./notification.service.js");
// ===========================================
// Task Service
// ===========================================
exports.taskService = {
    // List tasks for project
    async listTasks(projectId, query) {
        const { page, limit, sortBy, sortOrder, search, ...filters } = query;
        const skip = (page - 1) * limit;
        const where = {
            projectId,
            deletedAt: null,
        };
        if (filters.status) {
            where.status = Array.isArray(filters.status)
                ? { in: filters.status }
                : filters.status;
        }
        if (filters.priority) {
            where.priority = Array.isArray(filters.priority)
                ? { in: filters.priority }
                : filters.priority;
        }
        if (filters.assigneeId) {
            where.assigneeId = filters.assigneeId;
        }
        if (filters.labelIds && filters.labelIds.length > 0) {
            where.labels = {
                some: {
                    labelId: { in: filters.labelIds },
                },
            };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (filters.dueBefore) {
            where.dueDate = { ...(where.dueDate || {}), lte: new Date(filters.dueBefore) };
        }
        if (filters.dueAfter) {
            where.dueDate = { ...(where.dueDate || {}), gte: new Date(filters.dueAfter) };
        }
        if (filters.isMilestone !== undefined) {
            where.isMilestone = filters.isMilestone;
        }
        const [tasks, total] = await Promise.all([
            database_js_1.prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
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
            }),
            database_js_1.prisma.task.count({ where }),
        ]);
        return {
            data: tasks.map((t) => ({
                ...t,
                labels: t.labels.map((tl) => tl.label),
                commentsCount: t._count.comments,
                attachmentsCount: t._count.attachments,
            })),
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
    // Create task
    async createTask(projectId, userId, data) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        // Verify column belongs to project
        const column = await database_js_1.prisma.kanbanColumn.findFirst({
            where: { id: data.columnId, projectId },
        });
        if (!column) {
            throw new errors_js_1.BadRequestError('Invalid column');
        }
        // Get max order in column
        const maxOrder = await database_js_1.prisma.task.aggregate({
            where: { columnId: data.columnId },
            _max: { order: true },
        });
        const task = await database_js_1.prisma.task.create({
            data: {
                projectId,
                columnId: data.columnId,
                title: data.title,
                description: data.description,
                status: data.status || column.status,
                priority: data.priority,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                estimatedHours: data.estimatedHours,
                isMilestone: data.isMilestone,
                order: (maxOrder._max.order || 0) + 1,
                createdBy: userId,
                ...(data.labelIds && data.labelIds.length > 0 && {
                    labels: {
                        create: data.labelIds.map((labelId) => ({ labelId })),
                    },
                }),
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: { label: true },
                },
                column: true,
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: project.workspaceId,
            projectId,
            taskId: task.id,
            userId,
            action: 'created',
            entityType: 'task',
            entityId: task.id,
        });
        // Notify assignee if different from creator
        if (data.assigneeId && data.assigneeId !== userId) {
            await notification_service_js_1.notificationService.notifyTaskAssigned(task.id, data.assigneeId, userId);
        }
        return {
            ...task,
            labels: task.labels.map((tl) => tl.label),
        };
    },
    // Get task by ID
    async getTask(taskId) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: { label: true },
                },
                column: true,
                project: {
                    select: {
                        id: true,
                        name: true,
                        workspaceId: true,
                    },
                },
                dependencies: {
                    include: {
                        dependsOn: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
                    },
                },
                dependents: {
                    include: {
                        task: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                            },
                        },
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
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        return {
            ...task,
            labels: task.labels.map((tl) => tl.label),
            dependencies: task.dependencies.map((d) => ({
                id: d.id,
                type: d.type,
                task: d.dependsOn,
            })),
            dependents: task.dependents.map((d) => ({
                id: d.id,
                type: d.type,
                task: d.task,
            })),
            commentsCount: task._count.comments,
            attachmentsCount: task._count.attachments,
        };
    },
    // Update task
    async updateTask(taskId, userId, data) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.assigneeId !== undefined)
            updateData.assignee = data.assigneeId
                ? { connect: { id: data.assigneeId } }
                : { disconnect: true };
        if (data.order !== undefined)
            updateData.order = data.order;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.startDate !== undefined)
            updateData.startDate = data.startDate ? new Date(data.startDate) : null;
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        if (data.estimatedHours !== undefined)
            updateData.estimatedHours = data.estimatedHours;
        if (data.actualHours !== undefined)
            updateData.actualHours = data.actualHours;
        if (data.progress !== undefined)
            updateData.progress = data.progress;
        if (data.isMilestone !== undefined)
            updateData.isMilestone = data.isMilestone;
        if (data.columnId !== undefined)
            updateData.column = { connect: { id: data.columnId } };
        const updated = await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                labels: {
                    include: { label: true },
                },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { changes: data },
        });
        // Notify new assignee
        if (data.assigneeId && data.assigneeId !== task.assigneeId && data.assigneeId !== userId) {
            await notification_service_js_1.notificationService.notifyTaskAssigned(taskId, data.assigneeId, userId);
        }
        return {
            ...updated,
            labels: updated.labels.map((tl) => tl.label),
        };
    },
    // Delete task (soft delete)
    async deleteTask(taskId, userId) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date() },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'deleted',
            entityType: 'task',
            entityId: taskId,
        });
    },
    // Move task
    async moveTask(taskId, userId, data) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true, column: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const newColumn = await database_js_1.prisma.kanbanColumn.findFirst({
            where: { id: data.columnId, projectId: task.projectId },
        });
        if (!newColumn) {
            throw new errors_js_1.BadRequestError('Invalid column');
        }
        // Check task limit
        if (newColumn.taskLimit) {
            const tasksInColumn = await database_js_1.prisma.task.count({
                where: { columnId: data.columnId, deletedAt: null, id: { not: taskId } },
            });
            if (tasksInColumn >= newColumn.taskLimit) {
                throw new errors_js_1.BadRequestError(`Column "${newColumn.title}" has reached its task limit`);
            }
        }
        const fromColumnId = task.columnId;
        // Update task
        const updated = await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: {
                columnId: data.columnId,
                status: newColumn.status,
                order: data.order,
            },
        });
        // Reorder other tasks in the target column
        await database_js_1.prisma.task.updateMany({
            where: {
                columnId: data.columnId,
                order: { gte: data.order },
                id: { not: taskId },
                deletedAt: null,
            },
            data: {
                order: { increment: 1 },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'moved',
            entityType: 'task',
            entityId: taskId,
            metadata: {
                fromColumnId,
                toColumnId: data.columnId,
                fromStatus: task.status,
                toStatus: newColumn.status,
            },
        });
        return updated;
    },
    // Assign task
    async assignTask(taskId, userId, assigneeId) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const updated = await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: {
                assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'assigned',
            entityType: 'task',
            entityId: taskId,
            metadata: { assigneeId },
        });
        if (assigneeId && assigneeId !== userId) {
            await notification_service_js_1.notificationService.notifyTaskAssigned(taskId, assigneeId, userId);
        }
        return updated;
    },
    // Update labels
    async updateLabels(taskId, labelIds) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        // Remove existing labels and add new ones
        await database_js_1.prisma.$transaction([
            database_js_1.prisma.taskLabel.deleteMany({ where: { taskId } }),
            database_js_1.prisma.taskLabel.createMany({
                data: labelIds.map((labelId) => ({ taskId, labelId })),
            }),
        ]);
        const updated = await database_js_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                labels: {
                    include: { label: true },
                },
            },
        });
        return updated?.labels.map((tl) => tl.label) || [];
    },
    // Add dependency
    async addDependency(taskId, userId, data) {
        const [task, dependsOnTask] = await Promise.all([
            database_js_1.prisma.task.findFirst({ where: { id: taskId, deletedAt: null } }),
            database_js_1.prisma.task.findFirst({ where: { id: data.dependsOnTaskId, deletedAt: null } }),
        ]);
        if (!task || !dependsOnTask) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        if (task.projectId !== dependsOnTask.projectId) {
            throw new errors_js_1.BadRequestError('Tasks must be in the same project');
        }
        // Check for circular dependency
        const existingReverse = await database_js_1.prisma.taskDependency.findFirst({
            where: {
                taskId: data.dependsOnTaskId,
                dependsOnTaskId: taskId,
            },
        });
        if (existingReverse) {
            throw new errors_js_1.BadRequestError('Circular dependency detected');
        }
        const dependency = await database_js_1.prisma.taskDependency.create({
            data: {
                taskId,
                dependsOnTaskId: data.dependsOnTaskId,
                type: data.type,
            },
            include: {
                dependsOn: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
            },
        });
        return dependency;
    },
    // Remove dependency
    async removeDependency(depId) {
        await database_js_1.prisma.taskDependency.delete({
            where: { id: depId },
        });
    },
    // Get Gantt data
    async getGanttData(projectId) {
        const tasks = await database_js_1.prisma.task.findMany({
            where: { projectId, deletedAt: null },
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
            orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
        });
        return tasks.map((task) => ({
            id: task.id,
            title: task.title,
            startDate: task.startDate,
            endDate: task.endDate,
            dueDate: task.dueDate,
            progress: task.progress,
            status: task.status,
            priority: task.priority,
            isMilestone: task.isMilestone,
            assignee: task.assignee,
            dependencies: task.dependencies.map((d) => ({
                id: d.id,
                taskId: d.dependsOnTaskId,
                type: d.type,
            })),
        }));
    },
    // Update dates (for Gantt drag)
    async updateDates(taskId, userId, startDate, endDate) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const updated = await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: {
                startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { startDate, endDate },
        });
        return updated;
    },
    // Update progress
    async updateProgress(taskId, userId, progress) {
        const task = await database_js_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_js_1.NotFoundError('Task not found');
        }
        const updated = await database_js_1.prisma.task.update({
            where: { id: taskId },
            data: { progress },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { progress },
        });
        // Check if task is complete
        if (progress === 100 && task.assigneeId) {
            await notification_service_js_1.notificationService.notifyTaskCompleted(taskId);
        }
        return updated;
    },
};
exports.default = exports.taskService;
//# sourceMappingURL=task.service.js.map