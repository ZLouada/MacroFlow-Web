"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceLabelsParamSchema = exports.labelIdParamSchema = exports.updateLabelSchema = exports.createLabelSchema = exports.taskAttachmentsParamSchema = exports.attachmentIdParamSchema = exports.reactionParamSchema = exports.taskCommentsParamSchema = exports.commentIdParamSchema = exports.addReactionSchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Comment Validations
// ===========================================
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required').max(10000),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(10000),
});
exports.addReactionSchema = zod_1.z.object({
    emoji: zod_1.z.string().min(1).max(10),
});
exports.commentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.taskCommentsParamSchema = zod_1.z.object({
    taskId: zod_1.z.string().cuid(),
});
exports.reactionParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    emoji: zod_1.z.string().min(1).max(10),
});
// ===========================================
// Attachment Validations
// ===========================================
exports.attachmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.taskAttachmentsParamSchema = zod_1.z.object({
    taskId: zod_1.z.string().cuid(),
});
// ===========================================
// Label Validations
// ===========================================
exports.createLabelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(50),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});
exports.updateLabelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});
exports.labelIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.workspaceLabelsParamSchema = zod_1.z.object({
    workspaceId: zod_1.z.string().cuid(),
});
//# sourceMappingURL=comment.validation.js.map