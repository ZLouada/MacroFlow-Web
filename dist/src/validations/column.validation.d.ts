import { z } from 'zod';
export declare const createColumnSchema: z.ZodObject<{
    title: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>>;
    color: z.ZodOptional<z.ZodString>;
    taskLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "inProgress" | "review" | "done" | "blocked";
    title: string;
    color?: string | undefined;
    taskLimit?: number | null | undefined;
}, {
    title: string;
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
    color?: string | undefined;
    taskLimit?: number | null | undefined;
}>;
export declare const updateColumnSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taskLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    color?: string | null | undefined;
    title?: string | undefined;
    taskLimit?: number | null | undefined;
}, {
    color?: string | null | undefined;
    title?: string | undefined;
    taskLimit?: number | null | undefined;
}>;
export declare const reorderColumnsSchema: z.ZodObject<{
    columnIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    columnIds: string[];
}, {
    columnIds: string[];
}>;
export declare const columnIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const projectColumnsParamSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
//# sourceMappingURL=column.validation.d.ts.map