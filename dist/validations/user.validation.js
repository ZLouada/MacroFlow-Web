"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.userIdParamSchema = exports.updatePreferencesSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// User Validations
// ===========================================
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    avatar: zod_1.z.string().url().optional().nullable(),
});
exports.updatePreferencesSchema = zod_1.z.object({
    theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    language: zod_1.z.enum(['en', 'fr', 'ar']).optional(),
    notifyEmail: zod_1.z.boolean().optional(),
    notifyPush: zod_1.z.boolean().optional(),
    notifyTaskAssigned: zod_1.z.boolean().optional(),
    notifyTaskCompleted: zod_1.z.boolean().optional(),
    notifyTaskOverdue: zod_1.z.boolean().optional(),
    notifyMentions: zod_1.z.boolean().optional(),
    dashboardLayout: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.userIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.listUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.string().default('1').transform(Number),
    limit: zod_1.z.string().default('20').transform(Number),
    search: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'coo', 'projectManager', 'teamLead', 'developer', 'designer', 'viewer']).optional(),
    sortBy: zod_1.z.enum(['name', 'email', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
//# sourceMappingURL=user.validation.js.map