"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_js_1 = require("../controllers/project.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const project_validation_js_1 = require("../validations/project.validation.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Project CRUD (Workspace Scoped)
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/projects
 * @desc    List projects in workspace
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/projects', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.getAll));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/projects
 * @desc    Create a new project
 * @access  Private (Workspace Admin)
 */
router.post('/workspaces/:workspaceId/projects', (0, auth_middleware_js_1.requireWorkspaceAccess)([index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN, index_js_1.WorkspaceRole.MEMBER]), (0, error_middleware_js_1.validate)(project_validation_js_1.createProjectSchema), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.create));
// ===========================================
// Project Operations
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId
 * @desc    Get project details
 * @access  Private (Project Member)
 */
router.get('/:projectId', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.getById));
/**
 * @route   PATCH /api/v1/projects/:projectId
 * @desc    Update project
 * @access  Private (Project Manager)
 */
router.patch('/:projectId', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.validate)(project_validation_js_1.updateProjectSchema), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.update));
/**
 * @route   DELETE /api/v1/projects/:projectId
 * @desc    Delete project
 * @access  Private (Project Manager)
 */
router.delete('/:projectId', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.delete));
/**
 * @route   POST /api/v1/projects/:projectId/archive
 * @desc    Archive project
 * @access  Private (Project Manager)
 */
router.post('/:projectId/archive', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.archive));
/**
 * @route   POST /api/v1/projects/:projectId/restore
 * @desc    Restore archived project
 * @access  Private (Project Manager)
 */
router.post('/:projectId/restore', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.unarchive));
// ===========================================
// Project Members
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId/members
 * @desc    List project members
 * @access  Private (Project Member)
 */
router.get('/:projectId/members', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.getMembers));
/**
 * @route   POST /api/v1/projects/:projectId/members
 * @desc    Add member to project
 * @access  Private (Project Manager)
 */
router.post('/:projectId/members', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.validate)(project_validation_js_1.addProjectMemberSchema), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.addMember));
/**
 * @route   PATCH /api/v1/projects/:projectId/members/:memberId
 * @desc    Update project member role
 * @access  Private (Project Manager)
 */
router.patch('/:projectId/members/:memberId', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.validate)(project_validation_js_1.updateProjectMemberSchema), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.updateMemberRole));
/**
 * @route   DELETE /api/v1/projects/:projectId/members/:memberId
 * @desc    Remove member from project
 * @access  Private (Project Manager)
 */
router.delete('/:projectId/members/:memberId', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.removeMember));
// ===========================================
// Project Activity & Stats
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId/activity
 * @desc    Get project activity
 * @access  Private (Project Member)
 */
router.get('/:projectId/activity', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.getActivity));
/**
 * @route   GET /api/v1/projects/:projectId/stats
 * @desc    Get project statistics
 * @access  Private (Project Member)
 */
router.get('/:projectId/stats', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(project_controller_js_1.projectController.getStats));
exports.default = router;
//# sourceMappingURL=project.routes.js.map