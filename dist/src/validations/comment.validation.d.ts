import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const addReactionSchema: z.ZodObject<{
    emoji: z.ZodString;
}, "strip", z.ZodTypeAny, {
    emoji: string;
}, {
    emoji: string;
}>;
export declare const commentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const taskCommentsParamSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export declare const reactionParamSchema: z.ZodObject<{
    id: z.ZodString;
    emoji: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    emoji: string;
}, {
    id: string;
    emoji: string;
}>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type AddReactionInput = z.infer<typeof addReactionSchema>;
export declare const attachmentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const taskAttachmentsParamSchema: z.ZodObject<{
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taskId: string;
}, {
    taskId: string;
}>;
export declare const createLabelSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    color: string;
}, {
    name: string;
    color: string;
}>;
export declare const updateLabelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    color?: string | undefined;
}, {
    name?: string | undefined;
    color?: string | undefined;
}>;
export declare const labelIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const workspaceLabelsParamSchema: z.ZodObject<{
    workspaceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
}, {
    workspaceId: string;
}>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
//# sourceMappingURL=comment.validation.d.ts.map