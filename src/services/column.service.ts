import { prisma } from '../config/database.js';
import { Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

// ===========================================
// Column Service
// ===========================================

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

export const columnService = {
  // Get columns by project (alias for controller)
  async getColumnsByProject(projectId: string, includeTasks = true) {
    const columns = await prisma.kanbanColumn.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            labels: {
              include: { label: true },
            },
            _count: {
              select: { comments: true, attachments: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.attachments,
      })),
      tasksCount: col._count.tasks,
    }));
  },

  // Get column by ID
  async getColumnById(columnId: string) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            labels: {
              include: { label: true },
            },
            _count: {
              select: { comments: true, attachments: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    return {
      ...column,
      tasks: column.tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.attachments,
      })),
      tasksCount: column._count.tasks,
    };
  },

  // Create column
  async createColumn(projectId: string, userId: string, data: any) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Get max order
    const maxOrder = await prisma.kanbanColumn.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const column = await prisma.kanbanColumn.create({
      data: {
        projectId,
        title: data.title,
        status: data.status,
        color: data.color,
        taskLimit: data.taskLimit,
        order: (maxOrder._max?.order || 0) + 1,
      },
    });

    return column;
  },

  // Update column
  async updateColumn(columnId: string, userId: string, data: any) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const updateData: Prisma.KanbanColumnUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.taskLimit !== undefined) updateData.taskLimit = data.taskLimit;

    const updated = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: updateData,
    });

    return updated;
  },

  // Delete column
  async deleteColumn(columnId: string, userId: string, moveTasksTo?: string) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        _count: { select: { tasks: true } },
        project: true,
      },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    // If column has tasks, require target column
    if (column._count.tasks > 0) {
      if (!moveTasksTo) {
        throw new BadRequestError('Column has tasks. Specify a target column to move them to.');
      }

      // Verify target column belongs to same project
      const targetColumn = await prisma.kanbanColumn.findFirst({
        where: { id: moveTasksTo, projectId: column.projectId },
      });

      if (!targetColumn) {
        throw new NotFoundError('Target column not found');
      }

      // Move tasks to target column
      await prisma.task.updateMany({
        where: { columnId },
        data: { columnId: moveTasksTo, status: targetColumn.status },
      });
    }

    await prisma.kanbanColumn.delete({
      where: { id: columnId },
    });

    return { success: true };
  },

  // Reorder single column
  async reorderColumn(columnId: string, userId: string, position: number) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const oldPosition = column.order;

    // Update positions of other columns
    if (position < oldPosition) {
      // Moving up - increment columns between new and old position
      await prisma.kanbanColumn.updateMany({
        where: {
          projectId: column.projectId,
          order: { gte: position, lt: oldPosition },
          id: { not: columnId },
        },
        data: {
          order: { increment: 1 },
        },
      });
    } else if (position > oldPosition) {
      // Moving down - decrement columns between old and new position
      await prisma.kanbanColumn.updateMany({
        where: {
          projectId: column.projectId,
          order: { gt: oldPosition, lte: position },
          id: { not: columnId },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    const updated = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { order: position },
    });

    return updated;
  },

  // Reorder all columns
  async reorderAllColumns(projectId: string, userId: string, columnIds: string[]) {
    const updates = columnIds.map((columnId, index) =>
      prisma.kanbanColumn.update({
        where: { id: columnId },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return this.getColumnsByProject(projectId);
  },

  // Get tasks in column with pagination
  async getColumnTasks(columnId: string, options: PaginationOptions) {
    const { cursor, limit = 20 } = options;

    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const where: Prisma.TaskWhereInput = {
      columnId,
      deletedAt: null,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    const tasks = await prisma.task.findMany({
      where,
      take: limit + 1,
      orderBy: { order: 'asc' },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
    });

    const hasMore = tasks.length > limit;
    if (hasMore) tasks.pop();

    return {
      data: tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
        commentsCount: task._count.comments,
        attachmentsCount: task._count.attachments,
      })),
      pagination: {
        cursor: tasks.length > 0 ? tasks[tasks.length - 1].id : null,
        hasMore,
        limit,
      },
    };
  },

  // Set WIP limit
  async setWipLimit(columnId: string, userId: string, limit: number | null) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const updated = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { taskLimit: limit },
    });

    return updated;
  },

  // Set column color
  async setColumnColor(columnId: string, userId: string, color: string | null) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const updated = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { color },
    });

    return updated;
  },

  // Toggle collapse (note: schema doesn't have collapsed field, return column as-is)
  async toggleCollapse(columnId: string, userId: string, collapsed: boolean) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    // Schema doesn't have collapsed field, so we just return the column
    // This could be stored in user preferences instead
    return {
      ...column,
      collapsed,
    };
  },

  // Clear column (delete or archive all tasks)
  async clearColumn(columnId: string, userId: string, archive: boolean = false) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    const count = column._count.tasks;

    if (archive) {
      // Soft delete (archive)
      await prisma.task.updateMany({
        where: { columnId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    } else {
      // Hard delete
      await prisma.task.deleteMany({
        where: { columnId },
      });
    }

    return count;
  },

  // Legacy method aliases for backwards compatibility
  async getColumns(projectId: string, includeTasks = false) {
    return this.getColumnsByProject(projectId, includeTasks);
  },

  async reorderColumns(projectId: string, data: { columnIds: string[] }) {
    return this.reorderAllColumns(projectId, '', data.columnIds);
  },
};

export default columnService;
