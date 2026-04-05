"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const index_js_1 = require("../types/index.js");
// ===========================================
// User Service
// ===========================================
exports.userService = {
    // List users (admin only)
    async listUsers(query) {
        const { page, limit, search, role, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(role && { role }),
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
    // Get user by ID
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
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        return user;
    },
    // Update user profile
    async updateUser(userId, currentUserId, currentUserRole, data) {
        // Check permissions
        if (userId !== currentUserId && currentUserRole !== index_js_1.UserRole.ADMIN) {
            throw new errors_js_1.ForbiddenError('You can only update your own profile');
        }
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        const updatedUser = await database_js_1.prisma.user.update({
            where: { id: userId },
            data,
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
    // Update user preferences
    async updatePreferences(userId, data) {
        const preferences = await database_js_1.prisma.userPreferences.upsert({
            where: { userId },
            create: {
                userId,
                ...data,
            },
            update: data,
        });
        return preferences;
    },
    // Get user preferences
    async getPreferences(userId) {
        let preferences = await database_js_1.prisma.userPreferences.findUnique({
            where: { userId },
        });
        if (!preferences) {
            preferences = await database_js_1.prisma.userPreferences.create({
                data: { userId },
            });
        }
        return preferences;
    },
    // Delete user (soft delete)
    async deleteUser(userId, currentUserId, currentUserRole) {
        // Check permissions
        if (userId !== currentUserId && currentUserRole !== index_js_1.UserRole.ADMIN) {
            throw new errors_js_1.ForbiddenError('You can only delete your own account');
        }
        const user = await database_js_1.prisma.user.findUnique({
            where: { id: userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        // Soft delete
        await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() },
        });
        // Delete all sessions
        await database_js_1.prisma.session.deleteMany({
            where: { userId },
        });
    },
    // Update avatar
    async updateAvatar(userId, avatarUrl) {
        const user = await database_js_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                avatar: true,
            },
        });
        return user;
    },
    // Change password
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
    // Search users (for mentions, assignments)
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
};
exports.default = exports.userService;
//# sourceMappingURL=user.service.js.map