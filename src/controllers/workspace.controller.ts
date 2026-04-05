import { Response, NextFunction } from 'express';
import { workspaceService } from '../services/workspace.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const workspaceController = {
  /**
   * Create a new workspace
   * POST /api/v1/workspaces
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const workspace = await workspaceService.createWorkspace(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all workspaces for user
   * GET /api/v1/workspaces
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { cursor, limit } = req.query;

      const result = await workspaceService.getUserWorkspaces(req.user.id, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace by ID
   * GET /api/v1/workspaces/:workspaceId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const workspace = await workspaceService.getWorkspaceById(workspaceId);

      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update workspace
   * PATCH /api/v1/workspaces/:workspaceId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const workspace = await workspaceService.updateWorkspace(workspaceId, req.body);

      res.json({
        success: true,
        message: 'Workspace updated successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete workspace (soft delete)
   * DELETE /api/v1/workspaces/:workspaceId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      await workspaceService.deleteWorkspace(workspaceId);

      res.json({
        success: true,
        message: 'Workspace deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace members
   * GET /api/v1/workspaces/:workspaceId/members
   */
  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { cursor, limit, role } = req.query;

      const result = await workspaceService.getWorkspaceMembers(workspaceId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        role: role as string | undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add member to workspace
   * POST /api/v1/workspaces/:workspaceId/members
   */
  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { userId, email, role } = req.body;

      const member = await workspaceService.addMember(workspaceId, {
        userId,
        email,
        role,
      });

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update member role
   * PATCH /api/v1/workspaces/:workspaceId/members/:userId
   */
  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId, userId } = req.params;
      const { role } = req.body;

      const member = await workspaceService.updateMemberRole(workspaceId, userId, role);

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove member from workspace
   * DELETE /api/v1/workspaces/:workspaceId/members/:userId
   */
  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId, userId } = req.params;

      await workspaceService.removeMember(workspaceId, userId);

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Leave workspace (for current user)
   * POST /api/v1/workspaces/:workspaceId/leave
   */
  async leave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { workspaceId } = req.params;

      await workspaceService.leaveWorkspace(workspaceId, req.user.id);

      res.json({
        success: true,
        message: 'Left workspace successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Transfer workspace ownership
   * POST /api/v1/workspaces/:workspaceId/transfer
   */
  async transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { workspaceId } = req.params;
      const { newOwnerId } = req.body;

      const workspace = await workspaceService.transferOwnership(
        workspaceId,
        req.user.id,
        newOwnerId
      );

      res.json({
        success: true,
        message: 'Workspace ownership transferred successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create workspace invite link
   * POST /api/v1/workspaces/:workspaceId/invite
   */
  async createInviteLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { role, expiresIn } = req.body;

      const invite = await workspaceService.createInviteLink(workspaceId, {
        role,
        expiresIn,
      });

      res.status(201).json({
        success: true,
        message: 'Invite link created successfully',
        data: invite,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Join workspace via invite link
   * POST /api/v1/workspaces/join/:inviteCode
   */
  async joinViaInvite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { inviteCode } = req.params;

      const workspace = await workspaceService.joinViaInvite(inviteCode, req.user.id);

      res.json({
        success: true,
        message: 'Joined workspace successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace projects
   * GET /api/v1/workspaces/:workspaceId/projects
   */
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { cursor, limit, status } = req.query;

      const result = await workspaceService.getWorkspaceProjects(workspaceId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string | undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace activity
   * GET /api/v1/workspaces/:workspaceId/activity
   */
  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { cursor, limit, type } = req.query;

      const result = await workspaceService.getWorkspaceActivity(workspaceId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        type: type as string | undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace settings
   * GET /api/v1/workspaces/:workspaceId/settings
   */
  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const settings = await workspaceService.getWorkspaceSettings(workspaceId);

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update workspace settings
   * PATCH /api/v1/workspaces/:workspaceId/settings
   */
  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const settings = await workspaceService.updateWorkspaceSettings(workspaceId, req.body);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload workspace logo
   * POST /api/v1/workspaces/:workspaceId/logo
   */
  async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const workspace = await workspaceService.updateWorkspaceLogo(workspaceId, req.file);

      res.json({
        success: true,
        message: 'Workspace logo updated successfully',
        data: {
          logoUrl: workspace.logoUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get workspace statistics
   * GET /api/v1/workspaces/:workspaceId/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      const stats = await workspaceService.getWorkspaceStats(workspaceId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
