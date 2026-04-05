"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceMemberParamSchema = exports.workspaceIdParamSchema = exports.updateMemberRoleSchema = exports.inviteMemberSchema = exports.updateWorkspaceSchema = exports.createWorkspaceSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Workspace Validations
// ===========================================
exports.createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    icon: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    isPrivate: zod_1.z.boolean().default(false),
});
exports.updateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    icon: zod_1.z.string().optional().nullable(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    isPrivate: zod_1.z.boolean().optional(),
});
exports.inviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    role: zod_1.z.enum(['admin', 'member', 'guest']).default('member'),
});
exports.updateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['admin', 'member', 'guest']),
});
exports.workspaceIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.workspaceMemberParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    userId: zod_1.z.string().cuid(),
});
//# sourceMappingURL=workspace.validation.js.map