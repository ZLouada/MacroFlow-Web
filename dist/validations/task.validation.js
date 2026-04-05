"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasksQuerySchema = exports.bulkUpdateTasksSchema = exports.dependencyParamSchema = exports.projectTasksParamSchema = exports.taskIdParamSchema = exports.updateProgressSchema = exports.updateTaskDatesSchema = exports.addDependencySchema = exports.updateTaskLabelsSchema = exports.assignTaskSchema = exports.moveTaskSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Task Validations
// ===========================================
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    description: zod_1.z.string().max(5000).optional(),
    columnId: zod_1.z.string().cuid(),
    status: zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).default('todo'),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assigneeId: zod_1.z.string().cuid().optional().nullable(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
    estimatedHours: zod_1.z.number().min(0).optional().nullable(),
    isMilestone: zod_1.z.boolean().default(false),
    labelIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().max(5000).optional().nullable(),
    columnId: zod_1.z.string().cuid().optional(),
    status: zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigneeId: zod_1.z.string().cuid().optional().nullable(),
    order: zod_1.z.number().int().min(0).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
    estimatedHours: zod_1.z.number().min(0).optional().nullable(),
    actualHours: zod_1.z.number().min(0).optional().nullable(),
    progress: zod_1.z.number().min(0).max(100).optional(),
    isMilestone: zod_1.z.boolean().optional(),
});
exports.moveTaskSchema = zod_1.z.object({
    columnId: zod_1.z.string().cuid(),
    order: zod_1.z.number().int().min(0),
});
exports.assignTaskSchema = zod_1.z.object({
    assigneeId: zod_1.z.string().cuid().nullable(),
});
exports.updateTaskLabelsSchema = zod_1.z.object({
    labelIds: zod_1.z.array(zod_1.z.string().cuid()),
});
exports.addDependencySchema = zod_1.z.object({
    dependsOnTaskId: zod_1.z.string().cuid(),
    type: zod_1.z.enum(['finishToStart', 'startToStart', 'finishToFinish', 'startToFinish']).default('finishToStart'),
});
exports.updateTaskDatesSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
});
exports.updateProgressSchema = zod_1.z.object({
    progress: zod_1.z.number().min(0).max(100),
});
exports.taskIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.projectTasksParamSchema = zod_1.z.object({
    projectId: zod_1.z.string().cuid(),
});
exports.dependencyParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    depId: zod_1.z.string().cuid(),
});
exports.bulkUpdateTasksSchema = zod_1.z.object({
    taskIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'At least one task ID is required'),
    updates: zod_1.z.object({
        status: zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        assigneeId: zod_1.z.string().cuid().optional().nullable(),
        columnId: zod_1.z.string().cuid().optional(),
        labelIds: zod_1.z.array(zod_1.z.string().cuid()).optional(),
    }),
});
exports.listTasksQuerySchema = zod_1.z.object({
    status: zod_1.z.union([
        zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']),
        zod_1.z.array(zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked'])),
    ]).optional(),
    priority: zod_1.z.union([
        zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
        zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'urgent'])),
    ]).optional(),
    assigneeId: zod_1.z.string().cuid().optional(),
    labelIds: zod_1.z.string().transform(s => s.split(',')).optional(),
    search: zod_1.z.string().optional(),
    dueBefore: zod_1.z.string().datetime().optional(),
    dueAfter: zod_1.z.string().datetime().optional(),
    isMilestone: zod_1.z.string().transform(s => s === 'true').optional(),
    page: zod_1.z.string().default('1').transform(Number),
    limit: zod_1.z.string().default('50').transform(Number),
    sortBy: zod_1.z.enum(['title', 'dueDate', 'priority', 'status', 'createdAt', 'order']).default('order'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
//# sourceMappingURL=task.validation.js.map