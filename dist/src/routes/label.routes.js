"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const label_controller_js_1 = require("../controllers/label.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const comment_validation_js_1 = require("../validations/comment.validation.js"); // Labels are in comment validation
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Workspace Labels
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/labels
 * @desc    List workspace labels
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/labels', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.getByWorkspace));
/**
 * @route   POST /api/v1/workspaces/:workspaceId/labels
 * @desc    Create workspace label
 * @access  Private (Workspace Admin)
 */
router.post('/workspaces/:workspaceId/labels', (0, auth_middleware_js_1.requireWorkspaceAccess)(index_js_1.WorkspaceRole.OWNER, index_js_1.WorkspaceRole.ADMIN), (0, error_middleware_js_1.validate)({ body: comment_validation_js_1.createLabelSchema }), (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.create));
// ===========================================
// Project Labels
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId/labels
 * @desc    List project labels
 * @access  Private (Project Member)
 */
router.get('/projects/:projectId/labels', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.getByProject));
/**
 * @route   POST /api/v1/projects/:projectId/labels
 * @desc    Create project label
 * @access  Private (Project Manager)
 */
router.post('/projects/:projectId/labels', (0, auth_middleware_js_1.requireProjectAccess)(index_js_1.ProjectRole.MANAGER), (0, error_middleware_js_1.validate)({ body: comment_validation_js_1.createLabelSchema }), (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.create));
// ===========================================
// Individual Label Operations
// ===========================================
/**
 * @route   GET /api/v1/labels/:labelId
 * @desc    Get label details
 * @access  Private
 */
router.get('/:labelId', (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.getById));
/**
 * @route   PATCH /api/v1/labels/:labelId
 * @desc    Update label
 * @access  Private (Admin/Manager)
 */
router.patch('/:labelId', (0, error_middleware_js_1.validate)({ body: comment_validation_js_1.updateLabelSchema }), (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.update));
/**
 * @route   DELETE /api/v1/labels/:labelId
 * @desc    Delete label
 * @access  Private (Admin/Manager)
 */
router.delete('/:labelId', (0, error_middleware_js_1.asyncHandler)(label_controller_js_1.labelController.delete));
exports.default = router;
//# sourceMappingURL=label.routes.js.map