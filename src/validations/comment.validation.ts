import { z } from 'zod';

// ===========================================
// Comment Validations
// ===========================================

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const addReactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

export const commentIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const taskCommentsParamSchema = z.object({
  taskId: z.string().cuid(),
});

export const reactionParamSchema = z.object({
  id: z.string().cuid(),
  emoji: z.string().min(1).max(10),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;

// ===========================================
// Attachment Validations
// ===========================================

export const attachmentIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const taskAttachmentsParamSchema = z.object({
  taskId: z.string().cuid(),
});

// ===========================================
// Label Validations
// ===========================================

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const labelIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const workspaceLabelsParamSchema = z.object({
  workspaceId: z.string().cuid(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
