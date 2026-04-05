import { Prisma } from '@prisma/client';
interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
interface MemberFilterOptions extends PaginationOptions {
    role?: string;
}
interface ProjectFilterOptions extends PaginationOptions {
    status?: string;
}
interface ActivityFilterOptions extends PaginationOptions {
    type?: string;
}
export declare const workspaceService: {
    /**
     * Create a new workspace
     */
    createWorkspace(userId: string, data: {
        name: string;
        icon?: string;
        color?: string;
        isPrivate?: boolean;
    }): Promise<{
        owner: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
        _count: {
            projects: number;
            members: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
        ownerId: string;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    /**
     * Get user's workspaces with pagination
     */
    getUserWorkspaces(userId: string, options: PaginationOptions): Promise<{
        data: {
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
            _count: {
                projects: number;
                members: number;
            };
            name: string;
            id: string;
            createdAt: Date;
            slug: string;
            icon: string | null;
            color: string | null;
            isPersonal: boolean;
            isPremium: boolean;
            isPrivate: boolean;
            ownerId: string;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Get workspace by ID
     */
    getWorkspaceById(workspaceId: string): Promise<{
        owner: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
        _count: {
            projects: number;
            members: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
        ownerId: string;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    /**
     * Update workspace
     */
    updateWorkspace(workspaceId: string, data: {
        name?: string;
        icon?: string;
        color?: string;
        isPrivate?: boolean;
    }): Promise<{
        _count: {
            projects: number;
            members: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
        ownerId: string;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    /**
     * Delete workspace (soft delete)
     */
    deleteWorkspace(workspaceId: string): Promise<void>;
    /**
     * Get workspace members with pagination
     */
    getWorkspaceMembers(workspaceId: string, options: MemberFilterOptions): Promise<{
        data: {
            id: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
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
     * Add member to workspace
     */
    addMember(workspaceId: string, data: {
        userId?: string;
        email?: string;
        role?: string;
    }): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
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
    updateMemberRole(workspaceId: string, userId: string, role: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
        user: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    }>;
    /**
     * Remove member from workspace
     */
    removeMember(workspaceId: string, userId: string): Promise<void>;
    /**
     * Leave workspace
     */
    leaveWorkspace(workspaceId: string, userId: string): Promise<void>;
    /**
     * Transfer workspace ownership
     */
    transferOwnership(workspaceId: string, currentOwnerId: string, newOwnerId: string): Promise<{
        owner: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
        _count: {
            projects: number;
            members: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
        ownerId: string;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    /**
     * Create invite link
     */
    createInviteLink(workspaceId: string, options: {
        role?: string;
        expiresIn?: number;
    }): Promise<{
        inviteCode: string;
        workspaceId: string;
        role: string;
        expiresAt: Date;
        inviteUrl: string;
    }>;
    /**
     * Join workspace via invite code
     */
    joinViaInvite(inviteCode: string, userId: string): Promise<never>;
    /**
     * Get workspace projects
     */
    getWorkspaceProjects(workspaceId: string, options: ProjectFilterOptions): Promise<{
        data: ({
            creator: {
                name: string;
                id: string;
                avatar: string | null;
            };
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
            nextCursor: string | null;
        };
    }>;
    /**
     * Get workspace activity
     */
    getWorkspaceActivity(workspaceId: string, options: ActivityFilterOptions): Promise<{
        data: ({
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
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Get workspace settings
     */
    getWorkspaceSettings(workspaceId: string): Promise<{
        name: string;
        id: string;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
    }>;
    /**
     * Update workspace settings
     */
    updateWorkspaceSettings(workspaceId: string, data: {
        isPrivate?: boolean;
        isPremium?: boolean;
    }): Promise<{
        name: string;
        id: string;
        slug: string;
        icon: string | null;
        color: string | null;
        isPersonal: boolean;
        isPremium: boolean;
        isPrivate: boolean;
    }>;
    /**
     * Update workspace logo
     */
    updateWorkspaceLogo(workspaceId: string, file: Express.Multer.File): Promise<{
        logoUrl: string;
    }>;
    /**
     * Get workspace statistics
     */
    getWorkspaceStats(workspaceId: string): Promise<{
        members: number;
        projects: number;
        totalTasks: number;
        tasksByStatus: Record<string, number>;
        recentActivityCount: number;
    }>;
};
export default workspaceService;
//# sourceMappingURL=workspace.service.d.ts.map