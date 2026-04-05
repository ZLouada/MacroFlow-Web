import { z } from 'zod';

// ===========================================
// Column Validations
// ===========================================

export const createColumnSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  status: z.enum(['todo', 'inProgress', 'review', 'done', 'blocked']).default('todo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  taskLimit: z.number().int().min(1).optional().nullable(),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  taskLimit: z.number().int().min(1).optional().nullable(),
});

export const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string().cuid()),
});

export const columnIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const projectColumnsParamSchema = z.object({
  projectId: z.string().cuid(),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
