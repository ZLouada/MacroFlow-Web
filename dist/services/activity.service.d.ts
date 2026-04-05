import { ActivityAction, EntityType } from '../types/index.js';
interface LogActivityParams {
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    userId: string;
    action: ActivityAction | string;
    entityType: EntityType | string;
    entityId: string;
    metadata?: Record<string, unknown>;
}
export declare const activityService: {
    log(params: LogActivityParams): Promise<{
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
    }>;
    getByEntity(entityType: EntityType, entityId: string, limit?: number): Promise<({
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
    getTaskActivity(taskId: string, limit?: number): Promise<({
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
    getProjectActivity(projectId: string, limit?: number): Promise<({
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
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        taskId: string | null;
    })[]>;
    getWorkspaceActivity(workspaceId: string, limit?: number): Promise<({
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
    getUserActivity(userId: string, limit?: number): Promise<({
        task: {
            id: string;
            title: string;
        } | null;
        project: {
            name: string;
            id: string;
        } | null;
        workspace: {
            name: string;
            id: string;
        } | null;
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
};
export default activityService;
//# sourceMappingURL=activity.service.d.ts.map