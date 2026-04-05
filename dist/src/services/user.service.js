"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const upload_service_js_1 = require("./upload.service.js");
// ===========================================
// User Service
// ===========================================
exports.userService = {
    /**
     * List all users with pagination (admin)
     */
    async listUsers(options) {
        const { page = 1, limit = 20, search, role, sortBy = 'createdAt', sortOrder = 'desc', } = options;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(role && { role: role }),
        };
        const [users, total] = await Promise.all([
            database_js_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            }),
            database_js_1.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    },
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                emailVerified: true,
                twoFactorEnabled: true,
                createdAt: true,
                updatedAt: true,
                preferences: true,
            },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        return user;
    },
    /**
     * Update user profile
     */
    async updateUser(userId, data) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        // Check if email is being changed and if it's already taken
        if (data.email && data.email !== user.email) {
            const existingUser = await database_js_1.prisma.user.findUnique({
                where: { email: data.email.toLowerCase() },
            });
            if (existingUser) {
                throw new errors_js_1.BadRequestError('Email is already taken');
            }
        }
        const updatedUser = await database_js_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email.toLowerCase() }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                preferences: true,
            },
        });
        return updatedUser;
    },
    /**
     * Update user preferences
     */
    async updatePreferences(userId, data) {
        // Create a clean copy without userId to avoid duplication
        const { userId: _, ...cleanData } = data;
        // Handle dashboardLayout type
        if (cleanData.dashboardLayout !== undefined) {
            cleanData.dashboardLayout = cleanData.dashboardLayout;
        }
        const createData = {
            userId,
            ...cleanData,
        };
        const preferences = await database_js_1.prisma.userPreferences.upsert({
            where: { userId },
            create: createData,
            update: cleanData,
        });
        return preferences;
    },
    /**
     * Upload user avatar
     */
    async updateAvatar(userId, file) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        // Delete old avatar if exists
        if (user.avatar) {
            await upload_service_js_1.uploadService.deleteFile(user.avatar).catch(() => {
                // Ignore errors when deleting old avatar
            });
        }
        // Upload new avatar
        const result = await upload_service_js_1.uploadService.uploadFile(file, 'avatars');
        // Update user with new avatar URL
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: result.url },
        });
        return { avatarUrl: result.url };
    },
    /**
     * Delete user avatar
     */
    async deleteAvatar(userId) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        if (user.avatar) {
            await upload_service_js_1.uploadService.deleteFile(user.avatar).catch(() => {
                // Ignore errors when deleting avatar
            });
        }
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: null },
        });
    },
    /**
     * Search users (for mentions, assignments)
     */
    async searchUsers(query, workspaceId, limit = 10) {
        const where = {
            deletedAt: null,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ],
            ...(workspaceId && {
                workspaces: {
                    some: { workspaceId },
                },
            }),
        };
        const users = await database_js_1.prisma.user.findMany({
            where,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            },
        });
        return users;
    },
    /**
     * Get user's workspaces
     */
    async getUserWorkspaces(userId) {
        const memberships = await database_js_1.prisma.workspaceMember.findMany({
            where: { userId },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true,
                        createdAt: true,
                        _count: {
                            select: {
                                members: true,
                                projects: true,
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
        return memberships.map((m) => ({
            ...m.workspace,
            role: m.role,
            joinedAt: m.joinedAt,
        }));
    },
    /**
     * Get user's assigned tasks with pagination
     */
    async getUserTasks(userId, options) {
        const { status, priority, dueDate, cursor, limit = 20 } = options;
        const where = {
            assigneeId: userId,
            deletedAt: null,
            ...(status && { status: status }),
            ...(priority && { priority: priority }),
            ...(dueDate && {
                dueDate: {
                    lte: new Date(dueDate),
                },
            }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const tasks = await database_js_1.prisma.task.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                        workspace: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                labels: {
                    include: {
                        label: true,
                    },
                },
            },
        });
        const hasMore = tasks.length > limit;
        const data = hasMore ? tasks.slice(0, -1) : tasks;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get user's notifications with pagination
     */
    async getUserNotifications(userId, options) {
        const { unreadOnly, cursor, limit = 20 } = options;
        const where = {
            userId,
            ...(unreadOnly && { read: false }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const notifications = await database_js_1.prisma.notification.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
        });
        const hasMore = notifications.length > limit;
        const data = hasMore ? notifications.slice(0, -1) : notifications;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Delete user account (soft delete)
     */
    async deleteUser(userId, password) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new errors_js_1.ForbiddenError('Invalid password');
        }
        // Soft delete user
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
        // Delete all sessions
        await database_js_1.prisma.session.deleteMany({
            where: { userId },
        });
    },
    /**
     * Get user activity history
     */
    async getUserActivity(userId, options) {
        const { cursor, limit = 20 } = options;
        const where = {
            userId,
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const activities = await database_js_1.prisma.activity.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        const hasMore = activities.length > limit;
        const data = hasMore ? activities.slice(0, -1) : activities;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Update user role (admin only)
     */
    async updateUserRole(userId, role) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        const updatedUser = await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { role: role },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    },
    /**
     * Suspend user (admin only)
     */
    async suspendUser(userId, _reason) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        // Soft delete the user to suspend them
        const suspendedUser = await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                emailVerified: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        // Invalidate all sessions
        await database_js_1.prisma.session.deleteMany({
            where: { userId },
        });
        return suspendedUser;
    },
    /**
     * Activate user (admin only)
     */
    async activateUser(userId) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        const activatedUser = await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                emailVerified: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return activatedUser;
    },
    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new errors_js_1.ForbiddenError('Current password is incorrect');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        // Invalidate all other sessions
        await database_js_1.prisma.session.deleteMany({
            where: { userId },
        });
    },
};
exports.default = exports.userService;
//# sourceMappingURL=user.service.js.map