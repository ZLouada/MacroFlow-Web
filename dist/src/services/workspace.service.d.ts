import { WorkspaceRole } from '../types/index.js';
import { CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from '../validations/workspace.validation.js';
export declare const workspaceService: {
    listWorkspaces(userId: string): Promise<{
        role: import(".prisma/client").$Enums.WorkspaceRole;
        membersCount: number;
        projectsCount: number;
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
    }[]>;
    createWorkspace(userId: string, data: CreateWorkspaceInput): Promise<{
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
            workspaceId: string;
            role: import(".prisma/client").$Enums.WorkspaceRole;
            joinedAt: Date;
        })[];
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
    getWorkspace(workspaceId: string, userId: string): Promise<{
        membersCount: number;
        projectsCount: number;
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
    updateWorkspace(workspaceId: string, userId: string, data: UpdateWorkspaceInput): Promise<{
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
    deleteWorkspace(workspaceId: string, userId: string): Promise<void>;
    listMembers(workspaceId: string): Promise<{
        id: string;
        userId: string;
        name: string;
        email: string;
        avatar: string | null;
        userRole: import(".prisma/client").$Enums.UserRole;
        workspaceRole: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
    }[]>;
    inviteMember(workspaceId: string, inviterId: string, inviterName: string, data: InviteMemberInput): Promise<{
        invited: boolean;
        registered: boolean;
    }>;
    updateMemberRole(workspaceId: string, targetUserId: string, currentUserId: string, role: WorkspaceRole): Promise<{
        id: string;
        userId: string;
        workspaceId: string;
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
    }>;
    removeMember(workspaceId: string, targetUserId: string, currentUserId: string): Promise<void>;
    leaveWorkspace(workspaceId: string, userId: string): Promise<void>;
};
export default workspaceService;
//# sourceMappingURL=workspace.service.d.ts.map