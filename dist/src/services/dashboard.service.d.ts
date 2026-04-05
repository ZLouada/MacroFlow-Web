export declare const dashboardService: {
    getTaskSummary(userId: string, workspaceId?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        overdue: number;
        completed: number;
    }>;
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
        weekStart: string;
        completed: number;
        points: number;
    }[]>;
    getBurndown(projectId: string, sprintDays?: number): Promise<{
        date: string;
        planned: number;
        actual: number;
    }[]>;
    getUpcomingDeadlines(userId: string, days?: number): Promise<({
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
    })[]>;
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
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        taskId: string | null;
    })[]>;
    getTeamWorkload(projectId: string): Promise<{
        userId: string;
        name: string;
        avatar: string | null;
        tasksCount: number;
        estimatedHours: number;
        actualHours: number;
    }[]>;
};
export default dashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map