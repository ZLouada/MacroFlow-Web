"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const workspace_controller_js_1 = require("../controllers/workspace.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const rateLimit_middleware_js_1 = require("../middleware/rateLimit.middleware.js");
const workspace_validation_js_1 = require("../validations/workspace.validation.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// Configure multer for logo uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Workspace CRUD
// ===========================================
/**
 * @route   GET /api/v1/workspaces
 * @desc    List user's workspaces
 * @access  Private
 */
router.get('/', (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getAll));
/**
 * @route   POST /api/v1/workspaces
 * @desc    Create a new workspace
 * @access  Private
 */
router.post('/', (0, error_middleware_js_1.validate)({ body: workspace_validation_js_1.createWorkspaceSchema }), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.create));
/**
 * @route   GET /api/v1/workspaces/:workspaceId
 * @desc    Get workspace details
 * @access  Private (Workspace Member)
 */
router.get('/:workspaceId', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getById));
/**
 * @route   PATCH /api/v1/workspaces/:workspaceId
 * @desc    Update workspace
 * @access  Private (Workspace Admin)
 */
router.patch('/:workspaceId', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.validate)({ body: workspace_validation_js_1.updateWorkspaceSchema }), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.update));
/**
 * @route   DELETE /api/v1/workspaces/:workspaceId
 * @desc    Delete workspace
 * @access  Private (Workspace Owner)
 */
router.delete('/:workspaceId', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.delete));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/logo
 * @desc    Upload workspace logo
 * @access  Private (Workspace Admin)
 */
router.post('/:workspaceId/logo', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), rateLimit_middleware_js_1.uploadRateLimiter, upload.single('logo'), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.uploadLogo));
// ===========================================
// Workspace Members
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/members
 * @desc    List workspace members
 * @access  Private (Workspace Member)
 */
router.get('/:workspaceId/members', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getMembers));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/members
 * @desc    Add member to workspace
 * @access  Private (Workspace Admin)
 */
router.post('/:workspaceId/members', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.validate)({ body: workspace_validation_js_1.inviteMemberSchema }), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.addMember));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/members/invite
 * @desc    Invite member to workspace (by email)
 * @access  Private (Workspace Admin)
 */
router.post('/:workspaceId/members/invite', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.validate)({ body: workspace_validation_js_1.inviteMemberSchema }), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.addMember));
/**
 * @route   PATCH /api/v1/workspaces/:workspaceId/members/:memberId
 * @desc    Update member role
 * @access  Private (Workspace Admin)
 */
router.patch('/:workspaceId/members/:memberId', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.validate)({ body: workspace_validation_js_1.updateMemberRoleSchema }), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.updateMemberRole));
/**
 * @route   DELETE /api/v1/workspaces/:workspaceId/members/:memberId
 * @desc    Remove member from workspace
 * @access  Private (Workspace Admin)
 */
router.delete('/:workspaceId/members/:memberId', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.removeMember));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/leave
 * @desc    Leave workspace
 * @access  Private (Workspace Member)
 */
router.post('/:workspaceId/leave', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.leave));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/transfer
 * @desc    Transfer workspace ownership
 * @access  Private (Workspace Owner)
 */
router.post('/:workspaceId/transfer', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.transferOwnership));
// ===========================================
// Workspace Invites
// ===========================================
/**
 * @route   POST /api/v1/workspaces/:workspaceId/invite
 * @desc    Create workspace invite link
 * @access  Private (Workspace Admin)
 */
router.post('/:workspaceId/invite', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.createInviteLink));
/**
 * @route   POST /api/v1/workspaces/join/:inviteCode
 * @desc    Join workspace via invite link
 * @access  Private
 */
router.post('/join/:inviteCode', (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.joinViaInvite));
// ===========================================
// Workspace Projects
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/projects
 * @desc    Get workspace projects
 * @access  Private (Workspace Member)
 */
router.get('/:workspaceId/projects', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getProjects));
// ===========================================
// Workspace Activity & Stats
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/activity
 * @desc    Get workspace activity
 * @access  Private (Workspace Member)
 */
router.get('/:workspaceId/activity', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getActivity));
/**
 * @route   GET /api/v1/workspaces/:workspaceId/stats
 * @desc    Get workspace statistics
 * @access  Private (Workspace Member)
 */
router.get('/:workspaceId/stats', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getStats));
/**
 * @route   GET /api/v1/workspaces/:workspaceId/settings
 * @desc    Get workspace settings
 * @access  Private (Workspace Admin)
 */
router.get('/:workspaceId/settings', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.getSettings));
/**
 * @route   PATCH /api/v1/workspaces/:workspaceId/settings
 * @desc    Update workspace settings
 * @access  Private (Workspace Admin)
 */
router.patch('/:workspaceId/settings', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.asyncHandler)(workspace_controller_js_1.workspaceController.updateSettings));
exports.default = router;
//# sourceMappingURL=workspace.routes.js.map