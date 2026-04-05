"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectMemberParamSchema = exports.workspaceProjectsParamSchema = exports.projectIdParamSchema = exports.addProjectMemberSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Project Validations
// ===========================================
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: zod_1.z.string().max(1000).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    icon: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(1000).optional().nullable(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    icon: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['active', 'archived', 'completed']).optional(),
    startDate: zod_1.z.string().datetime().optional().nullable(),
    endDate: zod_1.z.string().datetime().optional().nullable(),
});
exports.addProjectMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid(),
    role: zod_1.z.enum(['manager', 'member', 'viewer']).default('member'),
});
exports.projectIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.workspaceProjectsParamSchema = zod_1.z.object({
    workspaceId: zod_1.z.string().cuid(),
});
exports.projectMemberParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    userId: zod_1.z.string().cuid(),
});
//# sourceMappingURL=project.validation.js.map