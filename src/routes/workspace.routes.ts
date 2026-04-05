import { Router } from 'express';
import multer from 'multer';
import { workspaceController } from '../controllers/workspace.controller';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { authenticate, requireWorkspaceAccess } from '../middleware/auth.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validations/workspace.validation';
import { WorkspaceRole } from '../types/index';

const router = Router();

// Configure multer for logo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// ===========================================
// Workspace CRUD
// ===========================================

/**
 * @route   GET /api/v1/workspaces
 * @desc    List user's workspaces
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(workspaceController.getAll)
);

/**
 * @route   POST /api/v1/workspaces
 * @desc    Create a new workspace
 * @access  Private
 */
router.post(
  '/',
  validate({ body: createWorkspaceSchema }),
  asyncHandler(workspaceController.create)
);

/**
 * @route   GET /api/v1/workspaces/:workspaceId
 * @desc    Get workspace details
 * @access  Private (Workspace Member)
 */
router.get(
  '/:workspaceId',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.getById)
);

/**
 * @route   PATCH /api/v1/workspaces/:workspaceId
 * @desc    Update workspace
 * @access  Private (Workspace Admin)
 */
router.patch(
  '/:workspaceId',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: updateWorkspaceSchema }),
  asyncHandler(workspaceController.update)
);

/**
 * @route   DELETE /api/v1/workspaces/:workspaceId
 * @desc    Delete workspace
 * @access  Private (Workspace Owner)
 */
router.delete(
  '/:workspaceId',
  requireWorkspaceAccess(WorkspaceRole.OWNER),
  asyncHandler(workspaceController.delete)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/logo
 * @desc    Upload workspace logo
 * @access  Private (Workspace Admin)
 */
router.post(
  '/:workspaceId/logo',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  uploadRateLimiter,
  upload.single('logo'),
  asyncHandler(workspaceController.uploadLogo)
);

// ===========================================
// Workspace Members
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/members
 * @desc    List workspace members
 * @access  Private (Workspace Member)
 */
router.get(
  '/:workspaceId/members',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.getMembers)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/members
 * @desc    Add member to workspace
 * @access  Private (Workspace Admin)
 */
router.post(
  '/:workspaceId/members',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: inviteMemberSchema }),
  asyncHandler(workspaceController.addMember)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/members/invite
 * @desc    Invite member to workspace (by email)
 * @access  Private (Workspace Admin)
 */
router.post(
  '/:workspaceId/members/invite',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: inviteMemberSchema }),
  asyncHandler(workspaceController.addMember)
);

/**
 * @route   PATCH /api/v1/workspaces/:workspaceId/members/:memberId
 * @desc    Update member role
 * @access  Private (Workspace Admin)
 */
router.patch(
  '/:workspaceId/members/:memberId',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  validate({ body: updateMemberRoleSchema }),
  asyncHandler(workspaceController.updateMemberRole)
);

/**
 * @route   DELETE /api/v1/workspaces/:workspaceId/members/:memberId
 * @desc    Remove member from workspace
 * @access  Private (Workspace Admin)
 */
router.delete(
  '/:workspaceId/members/:memberId',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  asyncHandler(workspaceController.removeMember)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/leave
 * @desc    Leave workspace
 * @access  Private (Workspace Member)
 */
router.post(
  '/:workspaceId/leave',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.leave)
);

/**
 * @route   POST /api/v1/workspaces/:workspaceId/transfer
 * @desc    Transfer workspace ownership
 * @access  Private (Workspace Owner)
 */
router.post(
  '/:workspaceId/transfer',
  requireWorkspaceAccess(WorkspaceRole.OWNER),
  asyncHandler(workspaceController.transferOwnership)
);

// ===========================================
// Workspace Invites
// ===========================================

/**
 * @route   POST /api/v1/workspaces/:workspaceId/invite
 * @desc    Create workspace invite link
 * @access  Private (Workspace Admin)
 */
router.post(
  '/:workspaceId/invite',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  asyncHandler(workspaceController.createInviteLink)
);

/**
 * @route   POST /api/v1/workspaces/join/:inviteCode
 * @desc    Join workspace via invite link
 * @access  Private
 */
router.post(
  '/join/:inviteCode',
  asyncHandler(workspaceController.joinViaInvite)
);

// ===========================================
// Workspace Projects
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/projects
 * @desc    Get workspace projects
 * @access  Private (Workspace Member)
 */
router.get(
  '/:workspaceId/projects',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.getProjects)
);

// ===========================================
// Workspace Activity & Stats
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/activity
 * @desc    Get workspace activity
 * @access  Private (Workspace Member)
 */
router.get(
  '/:workspaceId/activity',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.getActivity)
);

/**
 * @route   GET /api/v1/workspaces/:workspaceId/stats
 * @desc    Get workspace statistics
 * @access  Private (Workspace Member)
 */
router.get(
  '/:workspaceId/stats',
  requireWorkspaceAccess(),
  asyncHandler(workspaceController.getStats)
);

/**
 * @route   GET /api/v1/workspaces/:workspaceId/settings
 * @desc    Get workspace settings
 * @access  Private (Workspace Admin)
 */
router.get(
  '/:workspaceId/settings',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  asyncHandler(workspaceController.getSettings)
);

/**
 * @route   PATCH /api/v1/workspaces/:workspaceId/settings
 * @desc    Update workspace settings
 * @access  Private (Workspace Admin)
 */
router.patch(
  '/:workspaceId/settings',
  requireWorkspaceAccess(WorkspaceRole.OWNER, WorkspaceRole.ADMIN),
  asyncHandler(workspaceController.updateSettings)
);

export default router;
