import { z } from 'zod';

// ===========================================
// Project Validations
// ===========================================

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().optional().nullable(),
  status: z.enum(['active', 'archived', 'completed']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['manager', 'member', 'viewer']).default('member'),
});

export const projectIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const workspaceProjectsParamSchema = z.object({
  workspaceId: z.string().cuid(),
});

export const projectMemberParamSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
});

export const updateProjectMemberSchema = z.object({
  role: z.enum(['manager', 'member', 'viewer']),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>;
