interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
export declare const labelService: {
    getLabelsByProject(projectId: string): Promise<{
        tasksCount: number;
        _count: {
            tasks: number;
        };
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
    getLabelById(labelId: string): Promise<{
        tasksCount: number;
        _count: {
            tasks: number;
        };
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    createLabel(projectId: string, userId: string, data: {
        name: string;
        color: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    updateLabel(labelId: string, userId: string, data: {
        name?: string;
        color?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    deleteLabel(labelId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getTasksWithLabel(labelId: string, options?: PaginationOptions): Promise<{
        data: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            project: {
                name: string;
                id: string;
                color: string | null;
            };
            assignee: {
                name: string;
                id: string;
                avatar: string | null;
            } | null;
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            description: string | null;
            startDate: Date | null;
            endDate: Date | null;
            createdBy: string;
            priority: import(".prisma/client").$Enums.TaskPriority;
            dueDate: Date | null;
            columnId: string;
            title: string;
            assigneeId: string | null;
            order: number;
            estimatedHours: number | null;
            actualHours: number | null;
            progress: number;
            isMilestone: boolean;
        }[];
        pagination: {
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    mergeLabels(sourceLabelId: string, targetLabelId: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    bulkAddLabelToTasks(labelId: string, taskIds: string[], userId: string): Promise<number>;
    bulkRemoveLabelFromTasks(labelId: string, taskIds: string[], userId: string): Promise<number>;
    listLabels(workspaceId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
};
export default labelService;
//# sourceMappingURL=label.service.d.ts.map