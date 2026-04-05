import { z } from 'zod';

// ===========================================
// Workspace Validations
// ===========================================

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  isPrivate: z.boolean().default(false),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  icon: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  isPrivate: z.boolean().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member', 'guest']).default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'guest']),
});

export const workspaceIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const workspaceMemberParamSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
