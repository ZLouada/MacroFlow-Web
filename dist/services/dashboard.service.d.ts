import { Prisma } from '@prisma/client';
interface DateRangeOptions {
    startDate?: string;
    endDate?: string;
}
interface ProjectFilterOptions extends DateRangeOptions {
    projectId?: string;
}
interface VelocityOptions {
    period: 'day' | 'week' | 'month';
    count: number;
}
interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
interface UpcomingOptions extends PaginationOptions {
    projectId?: string;
    days?: number;
}
interface ExportOptions extends ProjectFilterOptions {
    format: 'csv' | 'json' | 'pdf';
}
export declare const dashboardService: {
    getWorkspaceDashboard(workspaceId: string): Promise<{
        workspace: {
            id: string;
            name: string;
        };
        stats: {
            projects: number;
            members: number;
            totalTasks: number;
            tasksByStatus: Record<string, number>;
        };
        recentActivity: ({
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
    }>;
    getProjectDashboard(projectId: string): Promise<{
        project: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
        };
        stats: {
            totalTasks: number;
            tasksByStatus: Record<string, number>;
            members: number;
            overdue: number;
            columns: {
                id: string;
                title: string;
                tasksCount: number;
            }[];
        };
        recentActivity: ({
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
    }>;
    getPersonalDashboard(userId: string): Promise<{
        stats: {
            totalTasks: number;
            tasksByStatus: Record<string, number>;
            overdue: number;
        };
        overdueTasks: ({
            project: {
                name: string;
                id: string;
                color: string | null;
            };
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
        upcomingDeadlines: ({
            project: {
                name: string;
                id: string;
                color: string | null;
            };
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
        recentActivity: ({
            task: {
                id: string;
                title: string;
            } | null;
            project: {
                name: string;
                id: string;
            } | null;
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
        workspaces: {
            name: string;
            id: string;
            icon: string | null;
        }[];
    }>;
    getTaskSummary(workspaceId: string, options?: ProjectFilterOptions): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        overdue: number;
        completed: number;
    }>;
    getVelocityMetrics(projectId: string, options: VelocityOptions): Promise<{
        period: string;
        startDate: string;
        endDate: string;
        completed: number;
        points: number;
    }[]>;
    getBurndownChart(projectId: string, options?: DateRangeOptions): Promise<{
        date: string;
        planned: number;
        actual: number;
    }[]>;
    getWorkloadDistribution(workspaceId: string, options?: {
        projectId?: string;
    }): Promise<{
        userId: string;
        name: string;
        avatar: string | null;
        tasksCount: number;
        estimatedHours: number;
        actualHours: number;
    }[]>;
    getActivityTimeline(workspaceId: string, options?: {
        projectId?: string;
        days?: number;
    }): Promise<{
        date: string;
        activities: ({
            task: {
                id: string;
                title: string;
            } | null;
            project: {
                name: string;
                id: string;
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
    }[]>;
    getOverdueTasks(workspaceId: string, options?: PaginationOptions & {
        projectId?: string;
    }): Promise<{
        data: ({
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
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    getUpcomingDeadlines(workspaceId: string, options?: UpcomingOptions): Promise<{
        data: ({
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
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    getCompletionRate(projectId: string, options: VelocityOptions): Promise<{
        period: string;
        startDate: string;
        endDate: string;
        total: number;
        completed: number;
        rate: number;
    }[]>;
    getCycleTimeAnalysis(projectId: string, options?: DateRangeOptions): Promise<{
        totalCompleted: number;
        avgCycleTimeDays: number;
        byPriority: {
            priority: string;
            count: number;
            avgCycleTimeDays: number;
        }[];
    }>;
    getLabelStats(projectId: string): Promise<{
        id: string;
        name: string;
        color: string;
        tasksCount: number;
        completedCount: number;
        completionRate: number;
    }[]>;
    exportAnalyticsReport(workspaceId: string, options: ExportOptions): Promise<string>;
    getMyTasks(userId: string, limit?: number): Promise<{
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
    getTeamVelocity(projectId: string, weeks?: number): Promise<{
        period: string;
        startDate: string;
        endDate: string;
        completed: number;
        points: number;
    }[]>;
    getBurndown(projectId: string, sprintDays?: number): Promise<{
        date: string;
        planned: number;
        actual: number;
    }[]>;
    getTeamWorkload(projectId: string): Promise<{
        userId: string;
        name: string;
        avatar: string | null;
        tasksCount: number;
        estimatedHours: number;
        actualHours: number;
    }[]>;
    getRecentActivity(userId: string, workspaceId?: string, limit?: number): Promise<({
        task: {
            id: string;
            title: string;
        } | null;
        project: {
            name: string;
            id: string;
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
    })[]>;
};
export default dashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map