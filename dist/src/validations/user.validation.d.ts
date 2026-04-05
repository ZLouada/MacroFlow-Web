import { z } from 'zod';
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatar?: string | null | undefined;
}, {
    name?: string | undefined;
    avatar?: string | null | undefined;
}>;
export declare const updatePreferencesSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    language: z.ZodOptional<z.ZodEnum<["en", "fr", "ar"]>>;
    notifyEmail: z.ZodOptional<z.ZodBoolean>;
    notifyPush: z.ZodOptional<z.ZodBoolean>;
    notifyTaskAssigned: z.ZodOptional<z.ZodBoolean>;
    notifyTaskCompleted: z.ZodOptional<z.ZodBoolean>;
    notifyTaskOverdue: z.ZodOptional<z.ZodBoolean>;
    notifyMentions: z.ZodOptional<z.ZodBoolean>;
    dashboardLayout: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    theme?: "system" | "light" | "dark" | undefined;
    language?: "en" | "fr" | "ar" | undefined;
    notifyEmail?: boolean | undefined;
    notifyPush?: boolean | undefined;
    notifyTaskAssigned?: boolean | undefined;
    notifyTaskCompleted?: boolean | undefined;
    notifyTaskOverdue?: boolean | undefined;
    notifyMentions?: boolean | undefined;
    dashboardLayout?: Record<string, unknown> | undefined;
}, {
    theme?: "system" | "light" | "dark" | undefined;
    language?: "en" | "fr" | "ar" | undefined;
    notifyEmail?: boolean | undefined;
    notifyPush?: boolean | undefined;
    notifyTaskAssigned?: boolean | undefined;
    notifyTaskCompleted?: boolean | undefined;
    notifyTaskOverdue?: boolean | undefined;
    notifyMentions?: boolean | undefined;
    dashboardLayout?: Record<string, unknown> | undefined;
}>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const listUsersQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "coo", "projectManager", "teamLead", "developer", "designer", "viewer"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "email", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "name" | "createdAt" | "email";
    sortOrder: "asc" | "desc";
    role?: "admin" | "coo" | "projectManager" | "teamLead" | "developer" | "designer" | "viewer" | undefined;
    search?: string | undefined;
}, {
    role?: "admin" | "coo" | "projectManager" | "teamLead" | "developer" | "designer" | "viewer" | undefined;
    limit?: string | undefined;
    search?: string | undefined;
    page?: string | undefined;
    sortBy?: "name" | "createdAt" | "email" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    avatar: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    timezone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    avatar?: string | null | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
}, {
    name?: string | undefined;
    avatar?: string | null | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
}>;
export declare const searchUsersSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    workspaceId?: string | undefined;
    projectId?: string | undefined;
    query?: string | undefined;
}, {
    workspaceId?: string | undefined;
    projectId?: string | undefined;
    limit?: string | undefined;
    query?: string | undefined;
}>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
//# sourceMappingURL=user.validation.d.ts.map