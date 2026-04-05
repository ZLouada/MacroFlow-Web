import { z } from 'zod';

// ===========================================
// User Validations
// ===========================================

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'fr', 'ar']).optional(),
  notifyEmail: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
  notifyTaskAssigned: z.boolean().optional(),
  notifyTaskCompleted: z.boolean().optional(),
  notifyTaskOverdue: z.boolean().optional(),
  notifyMentions: z.boolean().optional(),
  dashboardLayout: z.record(z.string(), z.unknown()).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const listUsersQuerySchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform(Number),
  search: z.string().optional(),
  role: z.enum(['admin', 'coo', 'projectManager', 'teamLead', 'developer', 'designer', 'viewer']).optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  workspaceId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  limit: z.string().default('10').transform(Number),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
