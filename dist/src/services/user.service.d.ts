import { Prisma } from '@prisma/client';
interface ListUsersOptions {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
interface PaginationOptions {
    cursor?: string;
    limit?: number;
}
interface TaskFilterOptions extends PaginationOptions {
    status?: string;
    priority?: string;
    dueDate?: string;
}
interface NotificationFilterOptions extends PaginationOptions {
    unreadOnly?: boolean;
}
export declare const userService: {
    /**
     * List all users with pagination (admin)
     */
    listUsers(options: ListUsersOptions): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string;
            avatar: string | null;
            emailVerified: boolean;
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
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        preferences: {
            id: string;
            userId: string;
            theme: import(".prisma/client").$Enums.Theme;
            language: import(".prisma/client").$Enums.Language;
            notifyEmail: boolean;
            notifyPush: boolean;
            notifyTaskAssigned: boolean;
            notifyTaskCompleted: boolean;
            notifyTaskOverdue: boolean;
            notifyMentions: boolean;
            dashboardLayout: Prisma.JsonValue | null;
        } | null;
    }>;
    /**
     * Update user profile
     */
    updateUser(userId: string, data: {
        name?: string;
        email?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
        preferences: {
            id: string;
            userId: string;
            theme: import(".prisma/client").$Enums.Theme;
            language: import(".prisma/client").$Enums.Language;
            notifyEmail: boolean;
            notifyPush: boolean;
            notifyTaskAssigned: boolean;
            notifyTaskCompleted: boolean;
            notifyTaskOverdue: boolean;
            notifyMentions: boolean;
            dashboardLayout: Prisma.JsonValue | null;
        } | null;
    }>;
    /**
     * Update user preferences
     */
    updatePreferences(userId: string, data: Record<string, unknown>): Promise<{
        id: string;
        userId: string;
        theme: import(".prisma/client").$Enums.Theme;
        language: import(".prisma/client").$Enums.Language;
        notifyEmail: boolean;
        notifyPush: boolean;
        notifyTaskAssigned: boolean;
        notifyTaskCompleted: boolean;
        notifyTaskOverdue: boolean;
        notifyMentions: boolean;
        dashboardLayout: Prisma.JsonValue | null;
    }>;
    /**
     * Upload user avatar
     */
    updateAvatar(userId: string, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
    /**
     * Delete user avatar
     */
    deleteAvatar(userId: string): Promise<void>;
    /**
     * Search users (for mentions, assignments)
     */
    searchUsers(query: string, workspaceId?: string, limit?: number): Promise<{
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    }[]>;
    /**
     * Get user's workspaces
     */
    getUserWorkspaces(userId: string): Promise<{
        role: import(".prisma/client").$Enums.WorkspaceRole;
        joinedAt: Date;
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        icon: string | null;
        _count: {
            projects: number;
            members: number;
        };
    }[]>;
    /**
     * Get user's assigned tasks with pagination
     */
    getUserTasks(userId: string, options: TaskFilterOptions): Promise<{
        data: ({
            project: {
                workspace: {
                    name: string;
                    id: string;
                };
                name: string;
                id: string;
            };
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
     * Get user's notifications with pagination
     */
    getUserNotifications(userId: string, options: NotificationFilterOptions): Promise<{
        data: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            id: string;
            userId: string;
            createdAt: Date;
            data: Prisma.JsonValue | null;
            title: string;
            read: boolean;
        }[];
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Delete user account (soft delete)
     */
    deleteUser(userId: string, password: string): Promise<void>;
    /**
     * Get user activity history
     */
    getUserActivity(userId: string, options: PaginationOptions): Promise<{
        data: ({
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
        pagination: {
            hasMore: boolean;
            nextCursor: string | null;
        };
    }>;
    /**
     * Update user role (admin only)
     */
    updateUserRole(userId: string, role: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
    }>;
    /**
     * Suspend user (admin only)
     */
    suspendUser(userId: string, _reason?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
    }>;
    /**
     * Activate user (admin only)
     */
    activateUser(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
    }>;
    /**
     * Change password
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
};
export default userService;
//# sourceMappingURL=user.service.d.ts.map