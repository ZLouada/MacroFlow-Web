import { CreateTaskInput, UpdateTaskInput, MoveTaskInput, AddDependencyInput, ListTasksQuery } from '../validations/task.validation.js';
export declare const taskService: {
    listTasks(projectId: string, query: ListTasksQuery): Promise<{
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
    createTask(projectId: string, userId: string, data: CreateTaskInput): Promise<{
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
    getTask(taskId: string): Promise<{
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
    updateTask(taskId: string, userId: string, data: UpdateTaskInput): Promise<{
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
    deleteTask(taskId: string, userId: string): Promise<void>;
    moveTask(taskId: string, userId: string, data: MoveTaskInput): Promise<{
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
    updateLabels(taskId: string, labelIds: string[]): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
    addDependency(taskId: string, userId: string, data: AddDependencyInput): Promise<{
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
    removeDependency(depId: string): Promise<void>;
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