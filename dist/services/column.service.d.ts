import { CreateColumnInput, UpdateColumnInput, ReorderColumnsInput } from '../validations/column.validation.js';
export declare const columnService: {
    getColumns(projectId: string, includeTasks?: boolean): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }[]>;
    createColumn(projectId: string, data: CreateColumnInput): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    updateColumn(columnId: string, data: UpdateColumnInput): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    deleteColumn(columnId: string, moveTasksTo?: string): Promise<void>;
    reorderColumns(projectId: string, data: ReorderColumnsInput): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }[]>;
};
export default columnService;
//# sourceMappingURL=column.service.d.ts.map