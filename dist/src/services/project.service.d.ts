import { CreateProjectInput, UpdateProjectInput, AddProjectMemberInput } from '../validations/project.validation.js';
export declare const projectService: {
    listProjects(workspaceId: string, userId: string): Promise<{
        tasksCount: number;
        membersCount: number;
        creator: {
            name: string;
            id: string;
            avatar: string | null;
        };
        _count: {
            members: number;
            tasks: number;
        };
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
    }[]>;
    createProject(workspaceId: string, userId: string, data: CreateProjectInput): Promise<{
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
    getProject(projectId: string, userId: string): Promise<{
        tasksCount: number;
        workspace: {
            members: {
                id: string;
                userId: string;
                workspaceId: string;
                role: import(".prisma/client").$Enums.WorkspaceRole;
                joinedAt: Date;
            }[];
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
        };
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
    updateProject(projectId: string, userId: string, data: UpdateProjectInput): Promise<{
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
    deleteProject(projectId: string, userId: string): Promise<void>;
    listMembers(projectId: string): Promise<{
        id: string;
        userId: string;
        name: string;
        email: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.ProjectRole;
        joinedAt: Date;
    }[]>;
    addMember(projectId: string, addedBy: string, data: AddProjectMemberInput): Promise<{
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
    }>;
    removeMember(projectId: string, targetUserId: string, removedBy: string): Promise<void>;
};
export default projectService;
//# sourceMappingURL=project.service.d.ts.map