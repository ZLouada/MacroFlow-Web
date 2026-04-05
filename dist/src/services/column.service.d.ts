interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
export declare const columnService: {
    getColumnsByProject(projectId: string, includeTasks?: boolean): Promise<{
        tasks: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
        tasksCount: number;
        _count: {
            tasks: number;
        };
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }[]>;
    getColumnById(columnId: string): Promise<{
        tasks: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
        tasksCount: number;
        _count: {
            tasks: number;
        };
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    createColumn(projectId: string, userId: string, data: any): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    updateColumn(columnId: string, userId: string, data: any): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    deleteColumn(columnId: string, userId: string, moveTasksTo?: string): Promise<{
        success: boolean;
    }>;
    reorderColumn(columnId: string, userId: string, position: number): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    reorderAllColumns(projectId: string, userId: string, columnIds: string[]): Promise<{
        tasks: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
        tasksCount: number;
        _count: {
            tasks: number;
        };
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }[]>;
    getColumnTasks(columnId: string, options: PaginationOptions): Promise<{
        data: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
    setWipLimit(columnId: string, userId: string, limit: number | null): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    setColumnColor(columnId: string, userId: string, color: string | null): Promise<{
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    toggleCollapse(columnId: string, userId: string, collapsed: boolean): Promise<{
        collapsed: boolean;
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }>;
    clearColumn(columnId: string, userId: string, archive?: boolean): Promise<number>;
    getColumns(projectId: string, includeTasks?: boolean): Promise<{
        tasks: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
        tasksCount: number;
        _count: {
            tasks: number;
        };
        status: import(".prisma/client").$Enums.TaskStatus;
        id: string;
        color: string | null;
        projectId: string;
        title: string;
        order: number;
        taskLimit: number | null;
    }[]>;
    reorderColumns(projectId: string, data: {
        columnIds: string[];
    }): Promise<{
        tasks: {
            labels: {
                name: string;
                id: string;
                createdAt: Date;
                workspaceId: string;
                color: string;
            }[];
            commentsCount: number;
            attachmentsCount: number;
            _count: {
                attachments: number;
                comments: number;
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
        tasksCount: number;
        _count: {
            tasks: number;
        };
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