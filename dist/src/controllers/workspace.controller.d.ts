import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const workspaceController: {
    /**
     * Create a new workspace
     * POST /api/v1/workspaces
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all workspaces for user
     * GET /api/v1/workspaces
     */
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace by ID
     * GET /api/v1/workspaces/:workspaceId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update workspace
     * PATCH /api/v1/workspaces/:workspaceId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete workspace (soft delete)
     * DELETE /api/v1/workspaces/:workspaceId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace members
     * GET /api/v1/workspaces/:workspaceId/members
     */
    getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add member to workspace
     * POST /api/v1/workspaces/:workspaceId/members
     */
    addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update member role
     * PATCH /api/v1/workspaces/:workspaceId/members/:userId
     */
    updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove member from workspace
     * DELETE /api/v1/workspaces/:workspaceId/members/:userId
     */
    removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Leave workspace (for current user)
     * POST /api/v1/workspaces/:workspaceId/leave
     */
    leave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Transfer workspace ownership
     * POST /api/v1/workspaces/:workspaceId/transfer
     */
    transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create workspace invite link
     * POST /api/v1/workspaces/:workspaceId/invite
     */
    createInviteLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Join workspace via invite link
     * POST /api/v1/workspaces/join/:inviteCode
     */
    joinViaInvite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace projects
     * GET /api/v1/workspaces/:workspaceId/projects
     */
    getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace activity
     * GET /api/v1/workspaces/:workspaceId/activity
     */
    getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace settings
     * GET /api/v1/workspaces/:workspaceId/settings
     */
    getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update workspace settings
     * PATCH /api/v1/workspaces/:workspaceId/settings
     */
    updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload workspace logo
     * POST /api/v1/workspaces/:workspaceId/logo
     */
    uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get workspace statistics
     * GET /api/v1/workspaces/:workspaceId/stats
     */
    getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=workspace.controller.d.ts.map