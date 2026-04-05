"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("../services/user.service");
const errors_1 = require("../utils/errors");
exports.userController = {
    /**
     * Get current user profile
     * GET /api/v1/users/me
     */
    async getProfile(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const user = await user_service_1.userService.getUserById(req.user.id);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update current user profile
     * PATCH /api/v1/users/me
     */
    async updateProfile(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const user = await user_service_1.userService.updateUser(req.user.id, req.body);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user by ID
     * GET /api/v1/users/:id
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_1.userService.getUserById(id);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Search users (for mentions, assignments, etc.)
     * GET /api/v1/users/search
     */
    async searchUsers(req, res, next) {
        try {
            const { query, workspaceId, limit } = req.query;
            const users = await user_service_1.userService.searchUsers(query, workspaceId, limit ? parseInt(limit, 10) : undefined);
            res.json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update user preferences
     * PATCH /api/v1/users/me/preferences
     */
    async updatePreferences(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const user = await user_service_1.userService.updatePreferences(req.user.id, req.body);
            res.json({
                success: true,
                message: 'Preferences updated successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Upload user avatar
     * POST /api/v1/users/me/avatar
     */
    async uploadAvatar(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            if (!req.file) {
                throw new errors_1.AppError('No file uploaded', 400);
            }
            const user = await user_service_1.userService.updateAvatar(req.user.id, req.file);
            res.json({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatarUrl: user.avatarUrl,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete user avatar
     * DELETE /api/v1/users/me/avatar
     */
    async deleteAvatar(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            await user_service_1.userService.deleteAvatar(req.user.id);
            res.json({
                success: true,
                message: 'Avatar deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Remove user avatar (alias for deleteAvatar)
     * DELETE /api/v1/users/avatar
     */
    async removeAvatar(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            await user_service_1.userService.deleteAvatar(req.user.id);
            res.json({
                success: true,
                message: 'Avatar removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user preferences
     * GET /api/v1/users/preferences
     */
    async getPreferences(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const user = await user_service_1.userService.getUserById(req.user.id);
            res.json({
                success: true,
                data: user.preferences || {},
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user's workspaces
     * GET /api/v1/users/me/workspaces
     */
    async getMyWorkspaces(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const workspaces = await user_service_1.userService.getUserWorkspaces(req.user.id);
            res.json({
                success: true,
                data: workspaces,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user's assigned tasks
     * GET /api/v1/users/me/tasks
     */
    async getMyTasks(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { status, priority, dueDate, cursor, limit } = req.query;
            const tasks = await user_service_1.userService.getUserTasks(req.user.id, {
                status: status,
                priority: priority,
                dueDate: dueDate,
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: tasks.data,
                pagination: tasks.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user's notifications
     * GET /api/v1/users/me/notifications
     */
    async getMyNotifications(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { unreadOnly, cursor, limit } = req.query;
            const notifications = await user_service_1.userService.getUserNotifications(req.user.id, {
                unreadOnly: unreadOnly === 'true',
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: notifications.data,
                pagination: notifications.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete user account (soft delete)
     * DELETE /api/v1/users/me
     */
    async deleteAccount(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { password, confirmation } = req.body;
            if (confirmation !== 'DELETE') {
                throw new errors_1.AppError('Please type DELETE to confirm account deletion', 400);
            }
            await user_service_1.userService.deleteUser(req.user.id, password);
            res.clearCookie('refreshToken');
            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get user activity history
     * GET /api/v1/users/activity
     */
    async getActivity(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { cursor, limit } = req.query;
            // Use activity service to get user's activity
            const result = await user_service_1.userService.getUserActivity(req.user.id, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    // ===========================================
    // Admin Routes
    // ===========================================
    /**
     * List all users (admin only)
     * GET /api/v1/users
     */
    async listUsers(req, res, next) {
        try {
            const { page, limit, search, role, sortBy, sortOrder } = req.query;
            const result = await user_service_1.userService.listUsers({
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                search: search,
                role: role,
                sortBy: sortBy || 'createdAt',
                sortOrder: sortOrder || 'desc',
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update user role (admin only)
     * PATCH /api/v1/users/:userId/role
     */
    async updateUserRole(req, res, next) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const user = await user_service_1.userService.updateUserRole(userId, role);
            res.json({
                success: true,
                message: 'User role updated successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Suspend user (admin only)
     * POST /api/v1/users/:userId/suspend
     */
    async suspendUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;
            const user = await user_service_1.userService.suspendUser(userId, reason);
            res.json({
                success: true,
                message: 'User suspended successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Activate user (admin only)
     * POST /api/v1/users/:userId/activate
     */
    async activateUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await user_service_1.userService.activateUser(userId);
            res.json({
                success: true,
                message: 'User activated successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=user.controller.js.map