import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    columnId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    estimatedHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    isMilestone: z.ZodDefault<z.ZodBoolean>;
    labelIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "inProgress" | "review" | "done" | "blocked";
    priority: "low" | "medium" | "high" | "urgent";
    columnId: string;
    title: string;
    isMilestone: boolean;
    description?: string | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    dueDate?: string | null | undefined;
    assigneeId?: string | null | undefined;
    estimatedHours?: number | null | undefined;
    labelIds?: string[] | undefined;
}, {
    columnId: string;
    title: string;
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
    description?: string | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    dueDate?: string | null | undefined;
    assigneeId?: string | null | undefined;
    estimatedHours?: number | null | undefined;
    isMilestone?: boolean | undefined;
    labelIds?: string[] | undefined;
}>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    columnId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
    assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    order: z.ZodOptional<z.ZodNumber>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    estimatedHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    actualHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    progress: z.ZodOptional<z.ZodNumber>;
    isMilestone: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    dueDate?: string | null | undefined;
    columnId?: string | undefined;
    title?: string | undefined;
    assigneeId?: string | null | undefined;
    order?: number | undefined;
    estimatedHours?: number | null | undefined;
    actualHours?: number | null | undefined;
    progress?: number | undefined;
    isMilestone?: boolean | undefined;
}, {
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | undefined;
    dueDate?: string | null | undefined;
    columnId?: string | undefined;
    title?: string | undefined;
    assigneeId?: string | null | undefined;
    order?: number | undefined;
    estimatedHours?: number | null | undefined;
    actualHours?: number | null | undefined;
    progress?: number | undefined;
    isMilestone?: boolean | undefined;
}>;
export declare const moveTaskSchema: z.ZodObject<{
    columnId: z.ZodString;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    columnId: string;
    order: number;
}, {
    columnId: string;
    order: number;
}>;
export declare const assignTaskSchema: z.ZodObject<{
    assigneeId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    assigneeId: string | null;
}, {
    assigneeId: string | null;
}>;
export declare const updateTaskLabelsSchema: z.ZodObject<{
    labelIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    labelIds: string[];
}, {
    labelIds: string[];
}>;
export declare const addDependencySchema: z.ZodObject<{
    dependsOnTaskId: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["finishToStart", "startToStart", "finishToFinish", "startToFinish"]>>;
}, "strip", z.ZodTypeAny, {
    type: "finishToStart" | "startToStart" | "finishToFinish" | "startToFinish";
    dependsOnTaskId: string;
}, {
    dependsOnTaskId: string;
    type?: "finishToStart" | "startToStart" | "finishToFinish" | "startToFinish" | undefined;
}>;
export declare const updateTaskDatesSchema: z.ZodObject<{
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>;
export declare const updateProgressSchema: z.ZodObject<{
    progress: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    progress: number;
}, {
    progress: number;
}>;
export declare const taskIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const projectTasksParamSchema: z.ZodObject<{
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    projectId: string;
}, {
    projectId: string;
}>;
export declare const dependencyParamSchema: z.ZodObject<{
    id: z.ZodString;
    depId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    depId: string;
}, {
    id: string;
    depId: string;
}>;
export declare const bulkUpdateTasksSchema: z.ZodObject<{
    taskIds: z.ZodArray<z.ZodString, "many">;
    updates: z.ZodObject<{
        status: z.ZodOptional<z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>>;
        priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "urgent"]>>;
        assigneeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        columnId: z.ZodOptional<z.ZodString>;
        labelIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
        priority?: "low" | "medium" | "high" | "urgent" | undefined;
        columnId?: string | undefined;
        assigneeId?: string | null | undefined;
        labelIds?: string[] | undefined;
    }, {
        status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
        priority?: "low" | "medium" | "high" | "urgent" | undefined;
        columnId?: string | undefined;
        assigneeId?: string | null | undefined;
        labelIds?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    taskIds: string[];
    updates: {
        status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
        priority?: "low" | "medium" | "high" | "urgent" | undefined;
        columnId?: string | undefined;
        assigneeId?: string | null | undefined;
        labelIds?: string[] | undefined;
    };
}, {
    taskIds: string[];
    updates: {
        status?: "todo" | "inProgress" | "review" | "done" | "blocked" | undefined;
        priority?: "low" | "medium" | "high" | "urgent" | undefined;
        columnId?: string | undefined;
        assigneeId?: string | null | undefined;
        labelIds?: string[] | undefined;
    };
}>;
export declare const listTasksQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>, z.ZodArray<z.ZodEnum<["todo", "inProgress", "review", "done", "blocked"]>, "many">]>>;
    priority: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["low", "medium", "high", "urgent"]>, z.ZodArray<z.ZodEnum<["low", "medium", "high", "urgent"]>, "many">]>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    labelIds: z.ZodOptional<z.ZodEffects<z.ZodString, string[], string>>;
    search: z.ZodOptional<z.ZodString>;
    dueBefore: z.ZodOptional<z.ZodString>;
    dueAfter: z.ZodOptional<z.ZodString>;
    isMilestone: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    page: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    sortBy: z.ZodDefault<z.ZodEnum<["title", "dueDate", "priority", "status", "createdAt", "order"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "priority" | "dueDate" | "title" | "order";
    sortOrder: "asc" | "desc";
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | ("todo" | "inProgress" | "review" | "done" | "blocked")[] | undefined;
    search?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | ("low" | "medium" | "high" | "urgent")[] | undefined;
    assigneeId?: string | undefined;
    isMilestone?: boolean | undefined;
    labelIds?: string[] | undefined;
    dueBefore?: string | undefined;
    dueAfter?: string | undefined;
}, {
    status?: "todo" | "inProgress" | "review" | "done" | "blocked" | ("todo" | "inProgress" | "review" | "done" | "blocked")[] | undefined;
    limit?: string | undefined;
    search?: string | undefined;
    priority?: "low" | "medium" | "high" | "urgent" | ("low" | "medium" | "high" | "urgent")[] | undefined;
    page?: string | undefined;
    sortBy?: "status" | "createdAt" | "priority" | "dueDate" | "title" | "order" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    assigneeId?: string | undefined;
    isMilestone?: string | undefined;
    labelIds?: string | undefined;
    dueBefore?: string | undefined;
    dueAfter?: string | undefined;
}>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type UpdateTaskLabelsInput = z.infer<typeof updateTaskLabelsSchema>;
export type AddDependencyInput = z.infer<typeof addDependencySchema>;
export type UpdateTaskDatesInput = z.infer<typeof updateTaskDatesSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
//# sourceMappingURL=task.validation.d.ts.map