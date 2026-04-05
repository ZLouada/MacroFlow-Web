import { Prisma } from '@prisma/client';
interface TaskFilters {
    status?: string | string[];
    priority?: string | string[];
    assigneeId?: string;
    labelIds?: string;
    search?: string;
    dueBefore?: string;
    dueAfter?: string;
    isMilestone?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
export declare const taskService: {
    getTasksByProject(projectId: string, filters: TaskFilters): Promise<{
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
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    createTask(projectId: string, userId: string, data: any): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
        column: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        };
        assignee: {
            name: string;
            id: string;
            email: string;
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
    }>;
    getTaskById(taskId: string): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
        dependencies: {
            id: string;
            type: import(".prisma/client").$Enums.DependencyType;
            task: {
                status: import(".prisma/client").$Enums.TaskStatus;
                id: string;
                title: string;
            };
        }[];
        dependents: {
            id: string;
            type: import(".prisma/client").$Enums.DependencyType;
            task: {
                status: import(".prisma/client").$Enums.TaskStatus;
                id: string;
                title: string;
            };
        }[];
        commentsCount: number;
        attachmentsCount: number;
        project: {
            name: string;
            id: string;
            workspaceId: string;
        };
        creator: {
            name: string;
            id: string;
            avatar: string | null;
        };
        _count: {
            attachments: number;
            comments: number;
        };
        column: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        };
        assignee: {
            name: string;
            id: string;
            email: string;
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
    }>;
    updateTask(taskId: string, userId: string, data: any): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
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
    }>;
    deleteTask(taskId: string, userId?: string): Promise<void>;
    moveTask(taskId: string, userId: string, columnId: string, position: number): Promise<{
        column: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        };
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    reorderTask(taskId: string, userId: string, position: number): Promise<{
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    assignTask(taskId: string, userId: string, assigneeId: string | null): Promise<{
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    unassignTask(taskId: string, userId: string, targetUserId: string): Promise<{
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    addLabelToTask(taskId: string, userId: string, labelId: string): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
        assignee?: {
            name: string;
            id: string;
            avatar: string | null;
        } | null | undefined;
        status?: import(".prisma/client").$Enums.TaskStatus | undefined;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        deletedAt?: Date | null | undefined;
        projectId?: string | undefined;
        description?: string | null | undefined;
        startDate?: Date | null | undefined;
        endDate?: Date | null | undefined;
        createdBy?: string | undefined;
        priority?: import(".prisma/client").$Enums.TaskPriority | undefined;
        dueDate?: Date | null | undefined;
        columnId?: string | undefined;
        title?: string | undefined;
        assigneeId?: string | null | undefined;
        order?: number | undefined;
        estimatedHours?: number | null | undefined;
        actualHours?: number | null | undefined;
        progress?: number | undefined;
        isMilestone?: boolean | undefined;
    }>;
    removeLabelFromTask(taskId: string, userId: string, labelId: string): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
        assignee?: {
            name: string;
            id: string;
            avatar: string | null;
        } | null | undefined;
        status?: import(".prisma/client").$Enums.TaskStatus | undefined;
        id?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        deletedAt?: Date | null | undefined;
        projectId?: string | undefined;
        description?: string | null | undefined;
        startDate?: Date | null | undefined;
        endDate?: Date | null | undefined;
        createdBy?: string | undefined;
        priority?: import(".prisma/client").$Enums.TaskPriority | undefined;
        dueDate?: Date | null | undefined;
        columnId?: string | undefined;
        title?: string | undefined;
        assigneeId?: string | null | undefined;
        order?: number | undefined;
        estimatedHours?: number | null | undefined;
        actualHours?: number | null | undefined;
        progress?: number | undefined;
        isMilestone?: boolean | undefined;
    }>;
    updateLabels(taskId: string, labelIds: string[]): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
    addDependency(taskId: string, userId: string, dependsOnId: string, type?: string): Promise<{
        dependsOn: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            title: string;
        };
    } & {
        type: import(".prisma/client").$Enums.DependencyType;
        id: string;
        createdAt: Date;
        taskId: string;
        dependsOnTaskId: string;
    }>;
    removeDependency(taskId: string, userId: string, dependencyId: string): Promise<{
        success: boolean;
    }>;
    getTaskComments(taskId: string, options: PaginationOptions): Promise<{
        data: ({
            author: {
                name: string;
                id: string;
                avatar: string | null;
            };
            reactions: {
                id: string;
                userId: string;
                createdAt: Date;
                commentId: string;
                emoji: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            taskId: string;
            authorId: string;
            content: string;
        })[];
        pagination: {
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    getTaskAttachments(taskId: string): Promise<({
        uploader: {
            name: string;
            id: string;
            avatar: string | null;
        };
    } & {
        type: string;
        name: string;
        id: string;
        url: string;
        size: number;
        taskId: string;
        uploadedBy: string;
        uploadedAt: Date;
    })[]>;
    addAttachment(taskId: string, userId: string, file: Express.Multer.File): Promise<{
        uploader: {
            name: string;
            id: string;
            avatar: string | null;
        };
    } & {
        type: string;
        name: string;
        id: string;
        url: string;
        size: number;
        taskId: string;
        uploadedBy: string;
        uploadedAt: Date;
    }>;
    deleteAttachment(taskId: string, attachmentId: string): Promise<{
        success: boolean;
    }>;
    getTaskActivity(taskId: string, options: PaginationOptions): Promise<{
        data: ({
            user: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            projectId: string | null;
            metadata: Prisma.JsonValue | null;
            taskId: string | null;
            action: import(".prisma/client").$Enums.ActivityAction;
            entityType: import(".prisma/client").$Enums.EntityType;
            entityId: string;
        })[];
        pagination: {
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    createSubtask(parentTaskId: string, userId: string, data: any): Promise<{
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
    getSubtasks(taskId: string): Promise<({
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
    } & {
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
    })[]>;
    duplicateTask(taskId: string, userId: string, options: {
        includeSubtasks?: boolean;
        includeComments?: boolean;
        includeAttachments?: boolean;
    }): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
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
    }>;
    watchTask(taskId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unwatchTask(taskId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logTime(taskId: string, userId: string, data: {
        minutes: number;
        description?: string;
        date?: string;
    }): Promise<{
        taskId: string;
        userId: string;
        minutes: number;
        description: string | undefined;
        loggedAt: Date;
        totalActualHours: number;
    }>;
    getTimeLogs(taskId: string, options: PaginationOptions & {
        userId?: string;
    }): Promise<{
        data: {
            id: string;
            taskId: string | null;
            user: {
                name: string;
                id: string;
                avatar: string | null;
            };
            minutes: any;
            description: any;
            loggedAt: Date;
        }[];
        totalActualHours: number;
        pagination: {
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    bulkUpdateTasks(taskIds: string[], userId: string, updates: any): Promise<{
        labels: {
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[];
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
    }[]>;
    bulkDeleteTasks(taskIds: string[]): Promise<number>;
    getGanttData(projectId: string): Promise<{
        id: string;
        title: string;
        startDate: Date | null;
        endDate: Date | null;
        dueDate: Date | null;
        progress: number;
        status: import(".prisma/client").$Enums.TaskStatus;
        priority: import(".prisma/client").$Enums.TaskPriority;
        isMilestone: boolean;
        assignee: {
            name: string;
            id: string;
            avatar: string | null;
        } | null;
        dependencies: {
            id: string;
            taskId: string;
            type: import(".prisma/client").$Enums.DependencyType;
        }[];
    }[]>;
    updateDates(taskId: string, userId: string, startDate?: string | null, endDate?: string | null): Promise<{
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
    }>;
    updateProgress(taskId: string, userId: string, progress: number): Promise<{
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
    }>;
};
export default taskService;
//# sourceMappingURL=task.service.d.ts.map