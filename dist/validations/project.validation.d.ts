import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    icon?: string | undefined;
    color?: string | undefined;
    description?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    name: string;
    icon?: string | undefined;
    color?: string | undefined;
    description?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["active", "archived", "completed"]>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "archived" | "completed" | undefined;
    name?: string | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    status?: "active" | "archived" | "completed" | undefined;
    name?: string | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>;
export declare const addProjectMemberSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["manager", "member", "viewer"]>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    role: "viewer" | "member" | "manager";
}, {
    userId: string;
    role?: "viewer" | "member" | "manager" | undefined;
}>;
export declare const projectIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const workspaceProjectsParamSchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
}, {
    workspaceId: string;
}>;
export declare const projectMemberParamSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
}, {
    id: string;
    userId: string;
}>;
export declare const updateProjectMemberSchema: z.ZodObject<{
    role: z.ZodEnum<["manager", "member", "viewer"]>;
}, "strip", z.ZodTypeAny, {
    role: "viewer" | "member" | "manager";
}, {
    role: "viewer" | "member" | "manager";
}>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>;
//# sourceMappingURL=project.validation.d.ts.map