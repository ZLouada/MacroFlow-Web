import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const userController: {
    /**
     * Get current user profile
     * GET /api/v1/users/me
     */
    getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update current user profile
     * PATCH /api/v1/users/me
     */
    updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user by ID
     * GET /api/v1/users/:id
     */
    getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Search users (for mentions, assignments, etc.)
     * GET /api/v1/users/search
     */
    searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user preferences
     * PATCH /api/v1/users/me/preferences
     */
    updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload user avatar
     * POST /api/v1/users/me/avatar
     */
    uploadAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete user avatar
     * DELETE /api/v1/users/me/avatar
     */
    deleteAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove user avatar (alias for deleteAvatar)
     * DELETE /api/v1/users/avatar
     */
    removeAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user preferences
     * GET /api/v1/users/preferences
     */
    getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's workspaces
     * GET /api/v1/users/me/workspaces
     */
    getMyWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's assigned tasks
     * GET /api/v1/users/me/tasks
     */
    getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user's notifications
     * GET /api/v1/users/me/notifications
     */
    getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete user account (soft delete)
     * DELETE /api/v1/users/me
     */
    deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user activity history
     * GET /api/v1/users/activity
     */
    getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * List all users (admin only)
     * GET /api/v1/users
     */
    listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user role (admin only)
     * PATCH /api/v1/users/:userId/role
     */
    updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Suspend user (admin only)
     * POST /api/v1/users/:userId/suspend
     */
    suspendUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Activate user (admin only)
     * POST /api/v1/users/:userId/activate
     */
    activateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=user.controller.d.ts.map