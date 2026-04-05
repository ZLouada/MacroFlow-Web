import { z } from 'zod';

// ===========================================
// Task Validations
// ===========================================

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  columnId: z.string().cuid(),
  status: z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  isMilestone: z.boolean().default(false),
  labelIds: z.array(z.string().cuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  columnId: z.string().cuid().optional(),
  status: z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  order: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  actualHours: z.number().min(0).optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  isMilestone: z.boolean().optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().cuid(),
  order: z.number().int().min(0),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().cuid().nullable(),
});

export const updateTaskLabelsSchema = z.object({
  labelIds: z.array(z.string().cuid()),
});

export const addDependencySchema = z.object({
  dependsOnTaskId: z.string().cuid(),
  type: z.enum(['finishToStart', 'startToStart', 'finishToFinish', 'startToFinish']).default('finishToStart'),
});

export const updateTaskDatesSchema = z.object({
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
});

export const taskIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const projectTasksParamSchema = z.object({
  projectId: z.string().cuid(),
});

export const dependencyParamSchema = z.object({
  id: z.string().cuid(),
  depId: z.string().cuid(),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1, 'At least one task ID is required'),
  updates: z.object({
    status: z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigneeId: z.string().cuid().optional().nullable(),
    columnId: z.string().cuid().optional(),
    labelIds: z.array(z.string().cuid()).optional(),
  }),
});

export const listTasksQuerySchema = z.object({
  status: z.union([
    z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']),
    z.array(z.enum(['todo', 'inProgress', 'review', 'done', 'blocked'])),
  ]).optional(),
  priority: z.union([
    z.enum(['low', 'medium', 'high', 'urgent']),
    z.array(z.enum(['low', 'medium', 'high', 'urgent'])),
  ]).optional(),
  assigneeId: z.string().cuid().optional(),
  labelIds: z.string().transform(s => s.split(',')).optional(),
  search: z.string().optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
  isMilestone: z.string().transform(s => s === 'true').optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('50').transform(Number),
  sortBy: z.enum(['title', 'dueDate', 'priority', 'status', 'createdAt', 'order']).default('order'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type UpdateTaskLabelsInput = z.infer<typeof updateTaskLabelsSchema>;
export type AddDependencyInput = z.infer<typeof addDependencySchema>;
export type UpdateTaskDatesInput = z.infer<typeof updateTaskDatesSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
