import { Prisma } from '@prisma/client';
import { ActivityAction, EntityType } from '../types';
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
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
        metadata: Prisma.JsonValue | null;
        taskId: string | null;
        action: import(".prisma/client").$Enums.ActivityAction;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
    })[]>;
};
export default activityService;
//# sourceMappingURL=activity.service.d.ts.map