import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const projectController = {
  /**
   * Get all projects in a workspace
   * GET /api/v1/workspaces/:workspaceId/projects
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { cursor, limit, status, search } = req.query;

      const result = await projectService.getWorkspaceProjects(workspaceId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string | undefined,
        search: search as string | undefined,
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
   * Create a new project
   * POST /api/v1/workspaces/:workspaceId/projects
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { workspaceId } = req.params;

      const project = await projectService.createProject(workspaceId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project by ID
   * GET /api/v1/projects/:projectId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const project = await projectService.getProjectById(projectId);

      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project
   * PATCH /api/v1/projects/:projectId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const project = await projectService.updateProject(projectId, req.body);

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete project (soft delete)
   * DELETE /api/v1/projects/:projectId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      await projectService.deleteProject(projectId);

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project members
   * GET /api/v1/projects/:projectId/members
   */
  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { cursor, limit, role } = req.query;

      const result = await projectService.getProjectMembers(projectId, {
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
   * Add member to project
   * POST /api/v1/projects/:projectId/members
   */
  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { userId, role } = req.body;

      const member = await projectService.addMember(projectId, userId, role);

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
   * Update member role in project
   * PATCH /api/v1/projects/:projectId/members/:userId
   */
  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;

      const member = await projectService.updateMemberRole(projectId, userId, role);

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
   * Remove member from project
   * DELETE /api/v1/projects/:projectId/members/:userId
   */
  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId, userId } = req.params;

      await projectService.removeMember(projectId, userId);

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project tasks
   * GET /api/v1/projects/:projectId/tasks
   */
  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { cursor, limit, status, priority, assigneeId, columnId, labels, search } = req.query;

      const result = await projectService.getProjectTasks(projectId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string | undefined,
        priority: priority as string | undefined,
        assigneeId: assigneeId as string | undefined,
        columnId: columnId as string | undefined,
        labels: labels ? (labels as string).split(',') : undefined,
        search: search as string | undefined,
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
   * Get project board (Kanban view)
   * GET /api/v1/projects/:projectId/board
   */
  async getBoard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const board = await projectService.getProjectBoard(projectId);

      res.json({
        success: true,
        data: board,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project Gantt data
   * GET /api/v1/projects/:projectId/gantt
   */
  async getGantt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;

      const gantt = await projectService.getProjectGantt(projectId, {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      res.json({
        success: true,
        data: gantt,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project activity
   * GET /api/v1/projects/:projectId/activity
   */
  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { cursor, limit, type } = req.query;

      const result = await projectService.getProjectActivity(projectId, {
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
   * Get project labels
   * GET /api/v1/projects/:projectId/labels
   */
  async getLabels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const labels = await projectService.getProjectLabels(projectId);

      res.json({
        success: true,
        data: labels,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get project statistics
   * GET /api/v1/projects/:projectId/stats
   */
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const stats = await projectService.getProjectStats(projectId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Duplicate project
   * POST /api/v1/projects/:projectId/duplicate
   */
  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { projectId } = req.params;
      const { name, includeMembers, includeTasks } = req.body;

      const project = await projectService.duplicateProject(projectId, req.user.id, {
        name,
        includeMembers,
        includeTasks,
      });

      res.status(201).json({
        success: true,
        message: 'Project duplicated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Archive project
   * POST /api/v1/projects/:projectId/archive
   */
  async archive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const project = await projectService.archiveProject(projectId);

      res.json({
        success: true,
        message: 'Project archived successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unarchive project
   * POST /api/v1/projects/:projectId/unarchive
   */
  async unarchive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const project = await projectService.unarchiveProject(projectId);

      res.json({
        success: true,
        message: 'Project unarchived successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update project settings
   * PATCH /api/v1/projects/:projectId/settings
   */
  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const settings = await projectService.updateProjectSettings(projectId, req.body);

      res.json({
        success: true,
        message: 'Project settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },
};
