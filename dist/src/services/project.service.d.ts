import { Prisma } from '@prisma/client';
interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
interface MemberFilterOptions extends PaginationOptions {
    role?: string;
}
interface TaskFilterOptions extends PaginationOptions {
    status?: string;
    priority?: string;
    assigneeId?: string;
    columnId?: string;
    labels?: string[];
    search?: string;
}
interface GanttOptions {
    startDate?: string;
    endDate?: string;
}
interface ActivityFilterOptions extends PaginationOptions {
    type?: string;
}
interface DuplicateOptions {
    name?: string;
    includeMembers?: boolean;
    includeTasks?: boolean;
}
export declare const projectService: {
    /**
     * Create a new project
     */
    createProject(workspaceId: string, userId: string, data: {
        name: string;
        description?: string;
        color?: string;
        icon?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        members: ({
            user: {
                name: string;
                id: string;
                email: string;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            role: import(".prisma/client").$Enums.ProjectRole;
            joinedAt: Date;
            projectId: string;
        })[];
        columns: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        }[];
        _count: {
            tasks: number;
        };
    } & {
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Get all projects in a workspace
     */
    getWorkspaceProjects(workspaceId: string, options: {
        cursor?: string;
        limit?: number;
        status?: string;
        search?: string;
    }): Promise<{
        data: ({
            _count: {
                members: number;
                tasks: number;
            };
        } & {
            status: import(".prisma/client").$Enums.ProjectStatus;
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            icon: string | null;
            color: string | null;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            startDate: Date | null;
            endDate: Date | null;
            createdBy: string;
        })[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | undefined;
        };
    }>;
    /**
     * Get project by ID
     */
    getProjectById(projectId: string): Promise<{
        workspace: {
            name: string;
            id: string;
            slug: string;
        };
        creator: {
            name: string;
            id: string;
            avatar: string | null;
        };
        columns: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        }[];
        _count: {
            members: number;
            tasks: number;
        };
    } & {
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Update project
     */
    updateProject(projectId: string, data: {
        name?: string;
        description?: string;
        color?: string;
        icon?: string;
        status?: string;
        startDate?: string | null;
        endDate?: string | null;
    }): Promise<{
        _count: {
            members: number;
            tasks: number;
        };
    } & {
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Delete project (soft delete)
     */
    deleteProject(projectId: string): Promise<void>;
    /**
     * Get project members with pagination
     */
    getProjectMembers(projectId: string, options: MemberFilterOptions): Promise<{
        data: {
            id: string;
            role: import(".prisma/client").$Enums.ProjectRole;
            joinedAt: Date;
            user: {
                name: string;
                id: string;
                email: string;
                avatar: string | null;
            };
        }[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Add member to project
     */
    addMember(projectId: string, userId: string, role?: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        user: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    }>;
    /**
     * Update member role
     */
    updateMemberRole(projectId: string, userId: string, role: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
        user: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    }>;
    /**
     * Remove member from project
     */
    removeMember(projectId: string, userId: string): Promise<void>;
    /**
     * Get project tasks with filtering and pagination
     */
    getProjectTasks(projectId: string, options: TaskFilterOptions): Promise<{
        data: ({
            labels: ({
                label: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    workspaceId: string;
                    color: string;
                };
            } & {
                id: string;
                createdAt: Date;
                taskId: string;
                labelId: string;
            })[];
            _count: {
                attachments: number;
                comments: number;
            };
            column: {
                id: string;
                color: string | null;
                title: string;
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
        })[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Get project board (Kanban view with columns and tasks)
     */
    getProjectBoard(projectId: string): Promise<{
        projectId: string;
        projectName: string;
        columns: ({
            tasks: ({
                labels: ({
                    label: {
                        name: string;
                        id: string;
                        createdAt: Date;
                        workspaceId: string;
                        color: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    taskId: string;
                    labelId: string;
                })[];
                _count: {
                    attachments: number;
                    comments: number;
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
            })[];
        } & {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        })[];
    }>;
    /**
     * Get project Gantt chart data
     */
    getProjectGantt(projectId: string, options: GanttOptions): Promise<{
        projectId: string;
        tasks: {
            id: string;
            title: string;
            startDate: Date | null;
            endDate: Date | null;
            progress: number;
            status: import(".prisma/client").$Enums.TaskStatus;
            priority: import(".prisma/client").$Enums.TaskPriority;
            assignee: {
                name: string;
                id: string;
                avatar: string | null;
            } | null;
            dependencies: string[];
            isMilestone: boolean;
        }[];
    }>;
    /**
     * Get project activity
     */
    getProjectActivity(projectId: string, options: ActivityFilterOptions): Promise<{
        data: ({
            task: {
                id: string;
                title: string;
            } | null;
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
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Get project labels
     */
    getProjectLabels(projectId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
    /**
     * Get project statistics
     */
    getProjectStats(projectId: string): Promise<{
        members: number;
        totalTasks: number;
        tasksByStatus: Record<string, number>;
        completionRate: number;
        overdueTasks: number;
        completedThisWeek: number;
    }>;
    /**
     * Duplicate project
     */
    duplicateProject(projectId: string, userId: string, options: DuplicateOptions): Promise<{
        members: ({
            user: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            userId: string;
            role: import(".prisma/client").$Enums.ProjectRole;
            joinedAt: Date;
            projectId: string;
        })[];
        columns: {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            color: string | null;
            projectId: string;
            title: string;
            order: number;
            taskLimit: number | null;
        }[];
    } & {
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Archive project
     */
    archiveProject(projectId: string): Promise<{
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Unarchive project
     */
    unarchiveProject(projectId: string): Promise<{
        status: import(".prisma/client").$Enums.ProjectStatus;
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        icon: string | null;
        color: string | null;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        createdBy: string;
    }>;
    /**
     * Update project settings
     */
    updateProjectSettings(projectId: string, data: {
        isPrivate?: boolean;
    }): Promise<{
        isPrivate?: boolean;
        projectId: string;
    }>;
};
export default projectService;
//# sourceMappingURL=project.service.d.ts.map