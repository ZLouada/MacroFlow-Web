import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

// ===========================================
// Label Service
// ===========================================

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

export const labelService = {
  // Get labels by project (using workspace since labels belong to workspace)
  async getLabelsByProject(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const labels = await prisma.label.findMany({
      where: { workspaceId: project.workspaceId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return labels.map((l) => ({
      ...l,
      tasksCount: l._count.tasks,
    }));
  },

  // Get label by ID
  async getLabelById(labelId: string) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    return {
      ...label,
      tasksCount: label._count.tasks,
    };
  },

  // Create label (using project to get workspace)
  async createLabel(projectId: string, userId: string, data: { name: string; color: string }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check if label with same name exists in workspace
    const existing = await prisma.label.findFirst({
      where: {
        workspaceId: project.workspaceId,
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestError('Label with this name already exists');
    }

    const label = await prisma.label.create({
      data: {
        workspaceId: project.workspaceId,
        name: data.name,
        color: data.color,
      },
    });

    return label;
  },

  // Update label
  async updateLabel(labelId: string, userId: string, data: { name?: string; color?: string }) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    // Check for duplicate name
    if (data.name && data.name !== label.name) {
      const existing = await prisma.label.findFirst({
        where: {
          workspaceId: label.workspaceId,
          name: data.name,
          id: { not: labelId },
        },
      });

      if (existing) {
        throw new BadRequestError('Label with this name already exists');
      }
    }

    const updated = await prisma.label.update({
      where: { id: labelId },
      data,
    });

    return updated;
  },

  // Delete label
  async deleteLabel(labelId: string, userId: string) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    // This will cascade delete TaskLabel entries
    await prisma.label.delete({
      where: { id: labelId },
    });

    return { success: true };
  },

  // Get tasks with label
  async getTasksWithLabel(labelId: string, options: PaginationOptions = {}) {
    const { cursor, limit = 20 } = options;

    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    const where: Prisma.TaskLabelWhereInput = {
      labelId,
      task: {
        deletedAt: null,
      },
    };

    if (cursor) {
      where.task = {
        ...where.task as any,
        id: { lt: cursor },
      };
    }

    const taskLabels = await prisma.taskLabel.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        task: {
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            project: {
              select: { id: true, name: true, color: true },
            },
            labels: {
              include: { label: true },
            },
          },
        },
      },
    });

    const hasMore = taskLabels.length > limit;
    if (hasMore) taskLabels.pop();

    const tasks = taskLabels.map((tl) => ({
      ...tl.task,
      labels: tl.task.labels.map((l) => l.label),
    }));

    return {
      data: tasks,
      pagination: {
        cursor: tasks.length > 0 ? tasks[tasks.length - 1].id : null,
        hasMore,
        limit,
      },
    };
  },

  // Merge labels
  async mergeLabels(sourceLabelId: string, targetLabelId: string, userId: string) {
    const [sourceLabel, targetLabel] = await Promise.all([
      prisma.label.findUnique({ where: { id: sourceLabelId } }),
      prisma.label.findUnique({ where: { id: targetLabelId } }),
    ]);

    if (!sourceLabel || !targetLabel) {
      throw new NotFoundError('Label not found');
    }

    if (sourceLabel.workspaceId !== targetLabel.workspaceId) {
      throw new BadRequestError('Labels must be in the same workspace');
    }

    // Get all tasks with source label
    const taskLabels = await prisma.taskLabel.findMany({
      where: { labelId: sourceLabelId },
    });

    // Add target label to tasks that don't already have it
    for (const tl of taskLabels) {
      const existing = await prisma.taskLabel.findFirst({
        where: {
          taskId: tl.taskId,
          labelId: targetLabelId,
        },
      });

      if (!existing) {
        await prisma.taskLabel.create({
          data: {
            taskId: tl.taskId,
            labelId: targetLabelId,
          },
        });
      }
    }

    // Delete source label (cascades to TaskLabel entries)
    await prisma.label.delete({
      where: { id: sourceLabelId },
    });

    return targetLabel;
  },

  // Bulk add label to tasks
  async bulkAddLabelToTasks(labelId: string, taskIds: string[], userId: string) {
    const label = await prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundError('Label not found');
    }

    // Get tasks that don't already have this label
    const existingTaskLabels = await prisma.taskLabel.findMany({
      where: {
        labelId,
        taskId: { in: taskIds },
      },
    });

    const existingTaskIds = new Set(existingTaskLabels.map((tl) => tl.taskId));
    const newTaskIds = taskIds.filter((id) => !existingTaskIds.has(id));

    if (newTaskIds.length > 0) {
      await prisma.taskLabel.createMany({
        data: newTaskIds.map((taskId) => ({ taskId, labelId })),
      });
    }

    return newTaskIds.length;
  },

  // Bulk remove label from tasks
  async bulkRemoveLabelFromTasks(labelId: string, taskIds: string[], userId: string) {
    const result = await prisma.taskLabel.deleteMany({
      where: {
        labelId,
        taskId: { in: taskIds },
      },
    });

    return result.count;
  },

  // Legacy methods for backwards compatibility
  async listLabels(workspaceId: string) {
    const labels = await prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });

    return labels;
  },
};

export default labelService;
