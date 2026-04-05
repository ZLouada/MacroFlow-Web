import { prisma } from '../config/database.js';
import { Prisma, TaskStatus, TaskPriority, DependencyType } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { activityService } from './activity.service.js';
import { notificationService } from './notification.service.js';
import { uploadService } from './upload.service.js';

// ===========================================
// Task Service
// ===========================================

interface TaskFilters {
  status?: string | string[];
  priority?: string | string[];
  assigneeId?: string;
  labelIds?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  isMilestone?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

export const taskService = {
  // Get tasks by project (alias for controller)
  async getTasksByProject(projectId: string, filters: TaskFilters) {
    const {
      status,
      priority,
      assigneeId,
      labelIds,
      search,
      dueBefore,
      dueAfter,
      isMilestone,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      projectId,
      deletedAt: null,
    };

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      where.status = { in: statusArray as TaskStatus[] };
    }

    if (priority) {
      const priorityArray = Array.isArray(priority) ? priority : [priority];
      where.priority = { in: priorityArray as TaskPriority[] };
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
      where.dueDate = { ...((where.dueDate as object) || {}), lte: new Date(dueBefore) };
    }

    if (dueAfter) {
      where.dueDate = { ...((where.dueDate as object) || {}), gte: new Date(dueAfter) };
    }

    if (isMilestone !== undefined) {
      where.isMilestone = isMilestone === 'true';
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
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
      prisma.task.count({ where }),
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
  async createTask(projectId: string, userId: string, data: any) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Verify column belongs to project
    const column = await prisma.kanbanColumn.findFirst({
      where: { id: data.columnId, projectId },
    });

    if (!column) {
      throw new BadRequestError('Invalid column');
    }

    // Get max order in column
    const maxOrder = await prisma.task.aggregate({
      where: { columnId: data.columnId },
      _max: { order: true },
    });

    const task = await prisma.task.create({
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
            create: data.labelIds.map((labelId: string) => ({ labelId })),
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

    await activityService.log({
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
      await notificationService.notifyTaskAssigned(task.id, data.assigneeId, userId);
    }

    return {
      ...task,
      labels: task.labels.map((tl) => tl.label),
    };
  },

  // Get task by ID
  async getTaskById(taskId: string) {
    const task = await prisma.task.findFirst({
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
      throw new NotFoundError('Task not found');
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
  async updateTask(taskId: string, userId: string, data: any) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updateData: Prisma.TaskUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assigneeId !== undefined) updateData.assignee = data.assigneeId 
      ? { connect: { id: data.assigneeId } } 
      : { disconnect: true };
    if (data.order !== undefined) updateData.order = data.order;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updateData.actualHours = data.actualHours;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.isMilestone !== undefined) updateData.isMilestone = data.isMilestone;
    if (data.columnId !== undefined) updateData.column = { connect: { id: data.columnId } };

    const updated = await prisma.task.update({
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

    await activityService.log({
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
      await notificationService.notifyTaskAssigned(taskId, data.assigneeId, userId);
    }

    return {
      ...updated,
      labels: updated.labels.map((tl) => tl.label),
    };
  },

  // Delete task (soft delete)
  async deleteTask(taskId: string, userId?: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    if (userId) {
      await activityService.log({
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
  async moveTask(taskId: string, userId: string, columnId: string, position: number) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true, column: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const newColumn = await prisma.kanbanColumn.findFirst({
      where: { id: columnId, projectId: task.projectId },
    });

    if (!newColumn) {
      throw new BadRequestError('Invalid column');
    }

    // Check task limit
    if (newColumn.taskLimit) {
      const tasksInColumn = await prisma.task.count({
        where: { columnId, deletedAt: null, id: { not: taskId } },
      });

      if (tasksInColumn >= newColumn.taskLimit) {
        throw new BadRequestError(`Column "${newColumn.title}" has reached its task limit`);
      }
    }

    const fromColumnId = task.columnId;

    // Update task
    const updated = await prisma.task.update({
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
    await prisma.task.updateMany({
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

    await activityService.log({
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
  async reorderTask(taskId: string, userId: string, position: number) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const oldPosition = task.order;

    // Update positions of other tasks
    if (position < oldPosition) {
      // Moving up - increment tasks between new and old position
      await prisma.task.updateMany({
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
    } else if (position > oldPosition) {
      // Moving down - decrement tasks between old and new position
      await prisma.task.updateMany({
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

    const updated = await prisma.task.update({
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
  async assignTask(taskId: string, userId: string, assigneeId: string | null) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updated = await prisma.task.update({
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

    await activityService.log({
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
      await notificationService.notifyTaskAssigned(taskId, assigneeId, userId);
    }

    return updated;
  },

  // Unassign user from task
  async unassignTask(taskId: string, userId: string, targetUserId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Only unassign if the target user is currently assigned
    if (task.assigneeId !== targetUserId) {
      throw new BadRequestError('User is not assigned to this task');
    }

    const updated = await prisma.task.update({
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

    await activityService.log({
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
  async addLabelToTask(taskId: string, userId: string, labelId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: { include: { workspace: true } } },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if label exists and belongs to the same workspace
    const label = await prisma.label.findFirst({
      where: { id: labelId, workspaceId: task.project.workspaceId },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    // Check if already assigned
    const existing = await prisma.taskLabel.findFirst({
      where: { taskId, labelId },
    });

    if (existing) {
      throw new BadRequestError('Label already assigned to task');
    }

    await prisma.taskLabel.create({
      data: { taskId, labelId },
    });

    const updated = await prisma.task.findUnique({
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
  async removeLabelFromTask(taskId: string, userId: string, labelId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await prisma.taskLabel.deleteMany({
      where: { taskId, labelId },
    });

    const updated = await prisma.task.findUnique({
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
  async updateLabels(taskId: string, labelIds: string[]) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Remove existing labels and add new ones
    await prisma.$transaction([
      prisma.taskLabel.deleteMany({ where: { taskId } }),
      prisma.taskLabel.createMany({
        data: labelIds.map((labelId) => ({ taskId, labelId })),
      }),
    ]);

    const updated = await prisma.task.findUnique({
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
  async addDependency(taskId: string, userId: string, dependsOnId: string, type: string = 'finishToStart') {
    const [task, dependsOnTask] = await Promise.all([
      prisma.task.findFirst({ where: { id: taskId, deletedAt: null }, include: { project: true } }),
      prisma.task.findFirst({ where: { id: dependsOnId, deletedAt: null } }),
    ]);

    if (!task || !dependsOnTask) {
      throw new NotFoundError('Task not found');
    }

    if (task.projectId !== dependsOnTask.projectId) {
      throw new BadRequestError('Tasks must be in the same project');
    }

    // Check for circular dependency
    const existingReverse = await prisma.taskDependency.findFirst({
      where: {
        taskId: dependsOnId,
        dependsOnTaskId: taskId,
      },
    });

    if (existingReverse) {
      throw new BadRequestError('Circular dependency detected');
    }

    const dependency = await prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId: dependsOnId,
        type: type as DependencyType,
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

    await activityService.log({
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
  async removeDependency(taskId: string, userId: string, dependencyId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const dependency = await prisma.taskDependency.findFirst({
      where: { id: dependencyId, taskId },
    });

    if (!dependency) {
      throw new NotFoundError('Dependency not found');
    }

    await prisma.taskDependency.delete({
      where: { id: dependencyId },
    });

    await activityService.log({
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
  async getTaskComments(taskId: string, options: PaginationOptions) {
    const { cursor, limit = 20 } = options;

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const where: Prisma.CommentWhereInput = {
      taskId,
      deletedAt: null,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const comments = await prisma.comment.findMany({
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
    if (hasMore) comments.pop();

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
  async getTaskAttachments(taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const attachments = await prisma.attachment.findMany({
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
  async addAttachment(taskId: string, userId: string, file: Express.Multer.File) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Upload file to S3
    const uploadResult = await uploadService.uploadFile(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      },
      'tasks/attachments',
      taskId
    );

    const attachment = await prisma.attachment.create({
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

    await activityService.log({
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
  async deleteAttachment(taskId: string, attachmentId: string) {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, taskId },
    });

    if (!attachment) {
      throw new NotFoundError('Attachment not found');
    }

    // Delete from S3
    await uploadService.deleteFile(attachment.url);

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { success: true };
  },

  // Get task activity
  async getTaskActivity(taskId: string, options: PaginationOptions) {
    const { cursor, limit = 20 } = options;

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const where: Prisma.ActivityWhereInput = {
      taskId,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const activities = await prisma.activity.findMany({
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
    if (hasMore) activities.pop();

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
  async createSubtask(parentTaskId: string, userId: string, data: any) {
    const parentTask = await prisma.task.findFirst({
      where: { id: parentTaskId, deletedAt: null },
      include: { project: true, column: true },
    });

    if (!parentTask) {
      throw new NotFoundError('Parent task not found');
    }

    // Get max order for tasks in the same column
    const maxOrder = await prisma.task.aggregate({
      where: { columnId: parentTask.columnId },
      _max: { order: true },
    });

    // Create a new task (as schema doesn't support subtasks with parentId)
    const subtask = await prisma.task.create({
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
    await prisma.taskDependency.create({
      data: {
        taskId: subtask.id,
        dependsOnTaskId: parentTaskId,
        type: 'finishToStart',
      },
    });

    await activityService.log({
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
  async getSubtasks(taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Get tasks that have this task as a dependency (simulating subtasks)
    const dependents = await prisma.taskDependency.findMany({
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
  async duplicateTask(taskId: string, userId: string, options: { includeSubtasks?: boolean; includeComments?: boolean; includeAttachments?: boolean }) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: {
        labels: true,
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Get max order
    const maxOrder = await prisma.task.aggregate({
      where: { columnId: task.columnId },
      _max: { order: true },
    });

    // Create duplicate
    const duplicate = await prisma.task.create({
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

    await activityService.log({
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
  async watchTask(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Since there's no TaskWatcher table, we can implement this via user preferences or return success
    // For now, we'll just return success (watching can be implemented via frontend state or extended schema)
    return { success: true, message: 'Task watch status updated' };
  },

  // Unwatch task
  async unwatchTask(taskId: string, userId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return { success: true, message: 'Task watch status updated' };
  },

  // Log time (using actualHours field since there's no TimeLog table)
  async logTime(taskId: string, userId: string, data: { minutes: number; description?: string; date?: string }) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Add logged time to actualHours
    const hoursToAdd = data.minutes / 60;
    const newActualHours = (task.actualHours || 0) + hoursToAdd;

    await prisma.task.update({
      where: { id: taskId },
      data: { actualHours: newActualHours },
    });

    await activityService.log({
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
  async getTimeLogs(taskId: string, options: PaginationOptions & { userId?: string }) {
    const { cursor, limit = 20, userId } = options;

    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Get activities where time was logged
    // Note: MongoDB JSON filtering is limited, so we filter metadata in post-processing
    const where: Prisma.ActivityWhereInput = {
      taskId,
      action: 'updated',
    };

    if (userId) {
      where.userId = userId;
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    const activities = await prisma.activity.findMany({
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
    if (hasMore) activities.pop();

    // Filter to only activities with timeLogged in metadata (MongoDB doesn't support deep JSON filtering)
    const timeLogActivities = activities.filter((a) => (a.metadata as any)?.timeLogged !== undefined);

    return {
      data: timeLogActivities.map((a) => ({
        id: a.id,
        taskId: a.taskId,
        user: a.user,
        minutes: (a.metadata as any)?.timeLogged || 0,
        description: (a.metadata as any)?.description,
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
  async bulkUpdateTasks(taskIds: string[], userId: string, updates: any) {
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, deletedAt: null },
      include: { project: true },
    });

    if (tasks.length === 0) {
      throw new NotFoundError('No tasks found');
    }

    await prisma.task.updateMany({
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
      await activityService.log({
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
    const updatedTasks = await prisma.task.findMany({
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
  async bulkDeleteTasks(taskIds: string[]) {
    const result = await prisma.task.updateMany({
      where: { id: { in: taskIds }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return result.count;
  },

  // Get Gantt data
  async getGanttData(projectId: string) {
    const tasks = await prisma.task.findMany({
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
  async updateDates(taskId: string, userId: string, startDate?: string | null, endDate?: string | null) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
      },
    });

    await activityService.log({
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
  async updateProgress(taskId: string, userId: string, progress: number) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { progress },
    });

    await activityService.log({
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
      await notificationService.notifyTaskCompleted(taskId);
    }

    return updated;
  },
};

export default taskService;
