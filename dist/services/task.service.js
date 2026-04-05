"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const activity_service_1 = require("./activity.service");
const notification_service_1 = require("./notification.service");
const upload_service_1 = require("./upload.service");
exports.taskService = {
    // Get tasks by project (alias for controller)
    async getTasksByProject(projectId, filters) {
        const { status, priority, assigneeId, labelIds, search, dueBefore, dueAfter, isMilestone, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = filters;
        const skip = (page - 1) * limit;
        const where = {
            projectId,
            deletedAt: null,
        };
        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            where.status = { in: statusArray };
        }
        if (priority) {
            const priorityArray = Array.isArray(priority) ? priority : [priority];
            where.priority = { in: priorityArray };
        }
        if (assigneeId) {
            where.assigneeId = assigneeId;
        }
        if (labelIds) {
            const labelIdArray = labelIds.split(',');
            where.labels = {
                some: {
                    labelId: { in: labelIdArray },
                },
            };
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (dueBefore) {
            where.dueDate = { ...(where.dueDate || {}), lte: new Date(dueBefore) };
        }
        if (dueAfter) {
            where.dueDate = { ...(where.dueDate || {}), gte: new Date(dueAfter) };
        }
        if (isMilestone !== undefined) {
            where.isMilestone = isMilestone === 'true';
        }
        const [tasks, total] = await Promise.all([
            database_1.prisma.task.findMany({
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
            database_1.prisma.task.count({ where }),
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
        const project = await database_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_1.NotFoundError('Project not found');
        }
        // Verify column belongs to project
        const column = await database_1.prisma.kanbanColumn.findFirst({
            where: { id: data.columnId, projectId },
        });
        if (!column) {
            throw new errors_1.BadRequestError('Invalid column');
        }
        // Get max order in column
        const maxOrder = await database_1.prisma.task.aggregate({
            where: { columnId: data.columnId },
            _max: { order: true },
        });
        const task = await database_1.prisma.task.create({
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
                order: (maxOrder._max?.order || 0) + 1,
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
        await activity_service_1.activityService.log({
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
            await notification_service_1.notificationService.notifyTaskAssigned(task.id, data.assigneeId, userId);
        }
        return {
            ...task,
            labels: task.labels.map((tl) => tl.label),
        };
    },
    // Get task by ID
    async getTaskById(taskId) {
        const task = await database_1.prisma.task.findFirst({
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
            throw new errors_1.NotFoundError('Task not found');
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
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
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
        const updated = await database_1.prisma.task.update({
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
        await activity_service_1.activityService.log({
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
            await notification_service_1.notificationService.notifyTaskAssigned(taskId, data.assigneeId, userId);
        }
        return {
            ...updated,
            labels: updated.labels.map((tl) => tl.label),
        };
    },
    // Delete task (soft delete)
    async deleteTask(taskId, userId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        await database_1.prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date() },
        });
        if (userId) {
            await activity_service_1.activityService.log({
                workspaceId: task.project.workspaceId,
                projectId: task.projectId,
                taskId,
                userId,
                action: 'deleted',
                entityType: 'task',
                entityId: taskId,
            });
        }
    },
    // Move task to column
    async moveTask(taskId, userId, columnId, position) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true, column: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const newColumn = await database_1.prisma.kanbanColumn.findFirst({
            where: { id: columnId, projectId: task.projectId },
        });
        if (!newColumn) {
            throw new errors_1.BadRequestError('Invalid column');
        }
        // Check task limit
        if (newColumn.taskLimit) {
            const tasksInColumn = await database_1.prisma.task.count({
                where: { columnId, deletedAt: null, id: { not: taskId } },
            });
            if (tasksInColumn >= newColumn.taskLimit) {
                throw new errors_1.BadRequestError(`Column "${newColumn.title}" has reached its task limit`);
            }
        }
        const fromColumnId = task.columnId;
        // Update task
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: {
                columnId,
                status: newColumn.status,
                order: position,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                column: true,
            },
        });
        // Reorder other tasks in the target column
        await database_1.prisma.task.updateMany({
            where: {
                columnId,
                order: { gte: position },
                id: { not: taskId },
                deletedAt: null,
            },
            data: {
                order: { increment: 1 },
            },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'moved',
            entityType: 'task',
            entityId: taskId,
            metadata: {
                fromColumnId,
                toColumnId: columnId,
                fromStatus: task.status,
                toStatus: newColumn.status,
            },
        });
        return updated;
    },
    // Reorder task within column
    async reorderTask(taskId, userId, position) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const oldPosition = task.order;
        // Update positions of other tasks
        if (position < oldPosition) {
            // Moving up - increment tasks between new and old position
            await database_1.prisma.task.updateMany({
                where: {
                    columnId: task.columnId,
                    order: { gte: position, lt: oldPosition },
                    id: { not: taskId },
                    deletedAt: null,
                },
                data: {
                    order: { increment: 1 },
                },
            });
        }
        else if (position > oldPosition) {
            // Moving down - decrement tasks between old and new position
            await database_1.prisma.task.updateMany({
                where: {
                    columnId: task.columnId,
                    order: { gt: oldPosition, lte: position },
                    id: { not: taskId },
                    deletedAt: null,
                },
                data: {
                    order: { decrement: 1 },
                },
            });
        }
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: { order: position },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return updated;
    },
    // Assign task
    async assignTask(taskId, userId, assigneeId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: {
                assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true },
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        await activity_service_1.activityService.log({
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
            await notification_service_1.notificationService.notifyTaskAssigned(taskId, assigneeId, userId);
        }
        return updated;
    },
    // Unassign user from task
    async unassignTask(taskId, userId, targetUserId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Only unassign if the target user is currently assigned
        if (task.assigneeId !== targetUserId) {
            throw new errors_1.BadRequestError('User is not assigned to this task');
        }
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: {
                assignee: { disconnect: true },
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { unassignedUserId: targetUserId },
        });
        return updated;
    },
    // Add label to task
    async addLabelToTask(taskId, userId, labelId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: { include: { workspace: true } } },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Check if label exists and belongs to the same workspace
        const label = await database_1.prisma.label.findFirst({
            where: { id: labelId, workspaceId: task.project.workspaceId },
        });
        if (!label) {
            throw new errors_1.NotFoundError('Label not found');
        }
        // Check if already assigned
        const existing = await database_1.prisma.taskLabel.findFirst({
            where: { taskId, labelId },
        });
        if (existing) {
            throw new errors_1.BadRequestError('Label already assigned to task');
        }
        await database_1.prisma.taskLabel.create({
            data: { taskId, labelId },
        });
        const updated = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                labels: {
                    include: { label: true },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            ...updated,
            labels: updated?.labels.map((tl) => tl.label) || [],
        };
    },
    // Remove label from task
    async removeLabelFromTask(taskId, userId, labelId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        await database_1.prisma.taskLabel.deleteMany({
            where: { taskId, labelId },
        });
        const updated = await database_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                labels: {
                    include: { label: true },
                },
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            ...updated,
            labels: updated?.labels.map((tl) => tl.label) || [],
        };
    },
    // Update labels (bulk)
    async updateLabels(taskId, labelIds) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Remove existing labels and add new ones
        await database_1.prisma.$transaction([
            database_1.prisma.taskLabel.deleteMany({ where: { taskId } }),
            database_1.prisma.taskLabel.createMany({
                data: labelIds.map((labelId) => ({ taskId, labelId })),
            }),
        ]);
        const updated = await database_1.prisma.task.findUnique({
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
    async addDependency(taskId, userId, dependsOnId, type = 'finishToStart') {
        const [task, dependsOnTask] = await Promise.all([
            database_1.prisma.task.findFirst({ where: { id: taskId, deletedAt: null }, include: { project: true } }),
            database_1.prisma.task.findFirst({ where: { id: dependsOnId, deletedAt: null } }),
        ]);
        if (!task || !dependsOnTask) {
            throw new errors_1.NotFoundError('Task not found');
        }
        if (task.projectId !== dependsOnTask.projectId) {
            throw new errors_1.BadRequestError('Tasks must be in the same project');
        }
        // Check for circular dependency
        const existingReverse = await database_1.prisma.taskDependency.findFirst({
            where: {
                taskId: dependsOnId,
                dependsOnTaskId: taskId,
            },
        });
        if (existingReverse) {
            throw new errors_1.BadRequestError('Circular dependency detected');
        }
        const dependency = await database_1.prisma.taskDependency.create({
            data: {
                taskId,
                dependsOnTaskId: dependsOnId,
                type: type,
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
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { dependsOnId, type },
        });
        return dependency;
    },
    // Remove dependency
    async removeDependency(taskId, userId, dependencyId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const dependency = await database_1.prisma.taskDependency.findFirst({
            where: { id: dependencyId, taskId },
        });
        if (!dependency) {
            throw new errors_1.NotFoundError('Dependency not found');
        }
        await database_1.prisma.taskDependency.delete({
            where: { id: dependencyId },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { removedDependencyId: dependencyId },
        });
        return { success: true };
    },
    // Get task comments
    async getTaskComments(taskId, options) {
        const { cursor, limit = 20 } = options;
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const where = {
            taskId,
            deletedAt: null,
        };
        if (cursor) {
            where.id = { lt: cursor };
        }
        const comments = await database_1.prisma.comment.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                reactions: true,
            },
        });
        const hasMore = comments.length > limit;
        if (hasMore)
            comments.pop();
        return {
            data: comments,
            pagination: {
                cursor: comments.length > 0 ? comments[comments.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Get task attachments
    async getTaskAttachments(taskId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const attachments = await database_1.prisma.attachment.findMany({
            where: { taskId },
            orderBy: { uploadedAt: 'desc' },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return attachments;
    },
    // Add attachment to task
    async addAttachment(taskId, userId, file) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Upload file to S3
        const uploadResult = await upload_service_1.uploadService.uploadFile({
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
        }, 'tasks/attachments', taskId);
        const attachment = await database_1.prisma.attachment.create({
            data: {
                taskId,
                name: file.originalname,
                url: uploadResult.url,
                type: file.mimetype,
                size: file.size,
                uploadedBy: userId,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: { attachmentAdded: file.originalname },
        });
        return attachment;
    },
    // Delete attachment from task
    async deleteAttachment(taskId, attachmentId) {
        const attachment = await database_1.prisma.attachment.findFirst({
            where: { id: attachmentId, taskId },
        });
        if (!attachment) {
            throw new errors_1.NotFoundError('Attachment not found');
        }
        // Delete from S3
        await upload_service_1.uploadService.deleteFile(attachment.url);
        await database_1.prisma.attachment.delete({
            where: { id: attachmentId },
        });
        return { success: true };
    },
    // Get task activity
    async getTaskActivity(taskId, options) {
        const { cursor, limit = 20 } = options;
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const where = {
            taskId,
        };
        if (cursor) {
            where.id = { lt: cursor };
        }
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
            },
        });
        const hasMore = activities.length > limit;
        if (hasMore)
            activities.pop();
        return {
            data: activities,
            pagination: {
                cursor: activities.length > 0 ? activities[activities.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Create subtask (note: schema doesn't have parentId, so this creates a regular task linked to same project)
    async createSubtask(parentTaskId, userId, data) {
        const parentTask = await database_1.prisma.task.findFirst({
            where: { id: parentTaskId, deletedAt: null },
            include: { project: true, column: true },
        });
        if (!parentTask) {
            throw new errors_1.NotFoundError('Parent task not found');
        }
        // Get max order for tasks in the same column
        const maxOrder = await database_1.prisma.task.aggregate({
            where: { columnId: parentTask.columnId },
            _max: { order: true },
        });
        // Create a new task (as schema doesn't support subtasks with parentId)
        const subtask = await database_1.prisma.task.create({
            data: {
                projectId: parentTask.projectId,
                columnId: parentTask.columnId,
                title: data.title,
                description: data.description || `Subtask of: ${parentTask.title}`,
                status: data.status || parentTask.status,
                priority: data.priority || parentTask.priority,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                order: (maxOrder._max?.order || 0) + 1,
                createdBy: userId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        // Create a dependency to link subtask to parent
        await database_1.prisma.taskDependency.create({
            data: {
                taskId: subtask.id,
                dependsOnTaskId: parentTaskId,
                type: 'finishToStart',
            },
        });
        await activity_service_1.activityService.log({
            workspaceId: parentTask.project.workspaceId,
            projectId: parentTask.projectId,
            taskId: subtask.id,
            userId,
            action: 'created',
            entityType: 'task',
            entityId: subtask.id,
            metadata: { relatedToTask: parentTaskId },
        });
        return subtask;
    },
    // Get subtasks (tasks that depend on this task)
    async getSubtasks(taskId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Get tasks that have this task as a dependency (simulating subtasks)
        const dependents = await database_1.prisma.taskDependency.findMany({
            where: { dependsOnTaskId: taskId },
            include: {
                task: {
                    include: {
                        assignee: {
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
        return dependents.map((d) => d.task).filter((t) => t.deletedAt === null);
    },
    // Duplicate task
    async duplicateTask(taskId, userId, options) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: {
                labels: true,
                project: true,
            },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Get max order
        const maxOrder = await database_1.prisma.task.aggregate({
            where: { columnId: task.columnId },
            _max: { order: true },
        });
        // Create duplicate
        const duplicate = await database_1.prisma.task.create({
            data: {
                projectId: task.projectId,
                columnId: task.columnId,
                title: `${task.title} (Copy)`,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                startDate: task.startDate,
                endDate: task.endDate,
                estimatedHours: task.estimatedHours,
                isMilestone: task.isMilestone,
                order: (maxOrder._max?.order || 0) + 1,
                createdBy: userId,
                labels: {
                    create: task.labels.map((tl) => ({ labelId: tl.labelId })),
                },
            },
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
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId: duplicate.id,
            userId,
            action: 'created',
            entityType: 'task',
            entityId: duplicate.id,
            metadata: { duplicatedFrom: taskId },
        });
        return {
            ...duplicate,
            labels: duplicate.labels.map((tl) => tl.label),
        };
    },
    // Watch task (using activity/notification subscription - no dedicated table in schema)
    async watchTask(taskId, userId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Since there's no TaskWatcher table, we can implement this via user preferences or return success
        // For now, we'll just return success (watching can be implemented via frontend state or extended schema)
        return { success: true, message: 'Task watch status updated' };
    },
    // Unwatch task
    async unwatchTask(taskId, userId) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        return { success: true, message: 'Task watch status updated' };
    },
    // Log time (using actualHours field since there's no TimeLog table)
    async logTime(taskId, userId, data) {
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Add logged time to actualHours
        const hoursToAdd = data.minutes / 60;
        const newActualHours = (task.actualHours || 0) + hoursToAdd;
        await database_1.prisma.task.update({
            where: { id: taskId },
            data: { actualHours: newActualHours },
        });
        await activity_service_1.activityService.log({
            workspaceId: task.project.workspaceId,
            projectId: task.projectId,
            taskId,
            userId,
            action: 'updated',
            entityType: 'task',
            entityId: taskId,
            metadata: {
                timeLogged: data.minutes,
                description: data.description,
                date: data.date,
            },
        });
        return {
            taskId,
            userId,
            minutes: data.minutes,
            description: data.description,
            loggedAt: data.date ? new Date(data.date) : new Date(),
            totalActualHours: newActualHours,
        };
    },
    // Get time logs (from activity log since there's no TimeLog table)
    async getTimeLogs(taskId, options) {
        const { cursor, limit = 20, userId } = options;
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        // Get activities where time was logged
        // Note: MongoDB JSON filtering is limited, so we filter metadata in post-processing
        const where = {
            taskId,
            action: 'updated',
        };
        if (userId) {
            where.userId = userId;
        }
        if (cursor) {
            where.id = { lt: cursor };
        }
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
            },
        });
        const hasMore = activities.length > limit;
        if (hasMore)
            activities.pop();
        // Filter to only activities with timeLogged in metadata (MongoDB doesn't support deep JSON filtering)
        const timeLogActivities = activities.filter((a) => a.metadata?.timeLogged !== undefined);
        return {
            data: timeLogActivities.map((a) => ({
                id: a.id,
                taskId: a.taskId,
                user: a.user,
                minutes: a.metadata?.timeLogged || 0,
                description: a.metadata?.description,
                loggedAt: a.createdAt,
            })),
            totalActualHours: task.actualHours || 0,
            pagination: {
                cursor: activities.length > 0 ? activities[activities.length - 1].id : null,
                hasMore,
                limit,
            },
        };
    },
    // Bulk update tasks
    async bulkUpdateTasks(taskIds, userId, updates) {
        const tasks = await database_1.prisma.task.findMany({
            where: { id: { in: taskIds }, deletedAt: null },
            include: { project: true },
        });
        if (tasks.length === 0) {
            throw new errors_1.NotFoundError('No tasks found');
        }
        await database_1.prisma.task.updateMany({
            where: { id: { in: taskIds } },
            data: {
                ...(updates.status !== undefined && { status: updates.status }),
                ...(updates.priority !== undefined && { priority: updates.priority }),
                ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId || null }),
                ...(updates.dueDate !== undefined && { dueDate: updates.dueDate ? new Date(updates.dueDate) : null }),
                ...(updates.columnId !== undefined && { columnId: updates.columnId }),
            },
        });
        // Log activity for each task
        for (const task of tasks) {
            await activity_service_1.activityService.log({
                workspaceId: task.project.workspaceId,
                projectId: task.projectId,
                taskId: task.id,
                userId,
                action: 'updated',
                entityType: 'task',
                entityId: task.id,
                metadata: { bulkUpdates: updates },
            });
        }
        // Fetch updated tasks
        const updatedTasks = await database_1.prisma.task.findMany({
            where: { id: { in: taskIds } },
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
        return updatedTasks.map((t) => ({
            ...t,
            labels: t.labels.map((tl) => tl.label),
        }));
    },
    // Bulk delete tasks
    async bulkDeleteTasks(taskIds) {
        const result = await database_1.prisma.task.updateMany({
            where: { id: { in: taskIds }, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        return result.count;
    },
    // Get Gantt data
    async getGanttData(projectId) {
        const tasks = await database_1.prisma.task.findMany({
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
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: {
                startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
            },
        });
        await activity_service_1.activityService.log({
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
        const task = await database_1.prisma.task.findFirst({
            where: { id: taskId, deletedAt: null },
            include: { project: true },
        });
        if (!task) {
            throw new errors_1.NotFoundError('Task not found');
        }
        const updated = await database_1.prisma.task.update({
            where: { id: taskId },
            data: { progress },
        });
        await activity_service_1.activityService.log({
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
            await notification_service_1.notificationService.notifyTaskCompleted(taskId);
        }
        return updated;
    },
};
exports.default = exports.taskService;
//# sourceMappingURL=task.service.js.map