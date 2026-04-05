import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { validate, asyncHandler } from '../middleware/error.middleware.js';
import { authenticate, requireWorkspaceAccess, requireProjectAccess } from '../middleware/auth.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberSchema,
} from '../validations/project.validation.js';
import { WorkspaceRole, ProjectRole } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Project CRUD (Workspace Scoped)
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/projects
 * @desc    List projects in workspace
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/projects',
  requireWorkspaceAccess(),
  asyncHandler(projectController.getAll)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/projects
 * @desc    Create a new project
 * @access  Private (Workspace Admin)
 */
router.post(
  '/workspaces/:workspaceId/projects',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER),
  validate({ body: createProjectSchema }),
  asyncHandler(projectController.create)
);

// ===========================================
// Project Operations
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId
 * @desc    Get project details
 * @access  Private (Project Member)
 */
router.get(
  '/:projectId',
  requireProjectAccess(),
  asyncHandler(projectController.getById)
);

/**
 * @route   PATCH /api/v1/projects/:projectId
 * @desc    Update project
 * @access  Private (Project Manager)
 */
router.patch(
  '/:projectId',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: updateProjectSchema }),
  asyncHandler(projectController.update)
);

/**
 * @route   DELETE /api/v1/projects/:projectId
 * @desc    Delete project
 * @access  Private (Project Manager)
 */
router.delete(
  '/:projectId',
  requireProjectAccess(ProjectRole.MANAGER),
  asyncHandler(projectController.delete)
);

/**
 * @route   POST /api/v1/projects/:projectId/archive
 * @desc    Archive project
 * @access  Private (Project Manager)
 */
router.post(
  '/:projectId/archive',
  requireProjectAccess(ProjectRole.MANAGER),
  asyncHandler(projectController.archive)
);

/**
 * @route   POST /api/v1/projects/:projectId/restore
 * @desc    Restore archived project
 * @access  Private (Project Manager)
 */
router.post(
  '/:projectId/restore',
  requireProjectAccess(ProjectRole.MANAGER),
  asyncHandler(projectController.unarchive)
);

// ===========================================
// Project Members
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId/members
 * @desc    List project members
 * @access  Private (Project Member)
 */
router.get(
  '/:projectId/members',
  requireProjectAccess(),
  asyncHandler(projectController.getMembers)
);

/**
 * @route   POST /api/v1/projects/:projectId/members
 * @desc    Add member to project
 * @access  Private (Project Manager)
 */
router.post(
  '/:projectId/members',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: addProjectMemberSchema }),
  asyncHandler(projectController.addMember)
);

/**
 * @route   PATCH /api/v1/projects/:projectId/members/:memberId
 * @desc    Update project member role
 * @access  Private (Project Manager)
 */
router.patch(
  '/:projectId/members/:memberId',
  requireProjectAccess(ProjectRole.MANAGER),
  validate({ body: updateProjectMemberSchema }),
  asyncHandler(projectController.updateMemberRole)
);

/**
 * @route   DELETE /api/v1/projects/:projectId/members/:memberId
 * @desc    Remove member from project
 * @access  Private (Project Manager)
 */
router.delete(
  '/:projectId/members/:memberId',
  requireProjectAccess(ProjectRole.MANAGER),
  asyncHandler(projectController.removeMember)
);

// ===========================================
// Project Activity & Stats
// ===========================================

/**
 * @route   GET /api/v1/projects/:projectId/activity
 * @desc    Get project activity
 * @access  Private (Project Member)
 */
router.get(
  '/:projectId/activity',
  requireProjectAccess(),
  asyncHandler(projectController.getActivity)
);

/**
 * @route   GET /api/v1/projects/:projectId/stats
 * @desc    Get project statistics
 * @access  Private (Project Member)
 */
router.get(
  '/:projectId/stats',
  requireProjectAccess(),
  asyncHandler(projectController.getStats)
);

export default router;
