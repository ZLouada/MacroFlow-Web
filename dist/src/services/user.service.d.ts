import { UserRole } from '../types/index.js';
import { UpdateUserInput, UpdatePreferencesInput, ListUsersQuery } from '../validations/user.validation.js';
export declare const userService: {
    listUsers(query: ListUsersQuery): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.UserRole;
            updatedAt: Date;
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
    getUserById(userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
    }>;
    updateUser(userId: string, currentUserId: string, currentUserRole: UserRole, data: UpdateUserInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        emailVerified: boolean;
    }>;
    updatePreferences(userId: string, data: UpdatePreferencesInput): Promise<{
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
        dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getPreferences(userId: string): Promise<{
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
        dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteUser(userId: string, currentUserId: string, currentUserRole: UserRole): Promise<void>;
    updateAvatar(userId: string, avatarUrl: string): Promise<{
        id: string;
        avatar: string | null;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    searchUsers(query: string, workspaceId?: string, limit?: number): Promise<{
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    }[]>;
};
export default userService;
//# sourceMappingURL=user.service.d.ts.map