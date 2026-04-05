"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectColumnsParamSchema = exports.columnIdParamSchema = exports.reorderColumnsSchema = exports.updateColumnSchema = exports.createColumnSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Column Validations
// ===========================================
exports.createColumnSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    status: zod_1.z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).default('todo'),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    taskLimit: zod_1.z.number().int().min(1).optional().nullable(),
});
exports.updateColumnSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    taskLimit: zod_1.z.number().int().min(1).optional().nullable(),
});
exports.reorderColumnsSchema = zod_1.z.object({
    columnIds: zod_1.z.array(zod_1.z.string().cuid()),
});
exports.columnIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.projectColumnsParamSchema = zod_1.z.object({
    projectId: zod_1.z.string().cuid(),
});
//# sourceMappingURL=column.validation.js.map