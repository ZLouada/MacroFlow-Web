import { z } from 'zod';
export declare const createWorkspaceSchema: z.ZodObject<{
    name: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isPrivate: boolean;
    icon?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    icon?: string | undefined;
    color?: string | undefined;
    isPrivate?: boolean | undefined;
}>;
export declare const updateWorkspaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    isPrivate?: boolean | undefined;
}, {
    name?: string | undefined;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    isPrivate?: boolean | undefined;
}>;
export declare const inviteMemberSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["admin", "member", "guest"]>>;
}, "strip", z.ZodTypeAny, {
    role: "admin" | "member" | "guest";
    email: string;
}, {
    email: string;
    role?: "admin" | "member" | "guest" | undefined;
}>;
export declare const updateMemberRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["admin", "member", "guest"]>;
}, "strip", z.ZodTypeAny, {
    role: "admin" | "member" | "guest";
}, {
    role: "admin" | "member" | "guest";
}>;
export declare const workspaceIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const workspaceMemberParamSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
}, {
    id: string;
    userId: string;
}>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
//# sourceMappingURL=workspace.validation.d.ts.map