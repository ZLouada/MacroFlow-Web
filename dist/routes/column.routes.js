"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const column_controller_js_1 = require("../controllers/column.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const column_validation_js_1 = require("../validations/column.validation.js");
const index_js_1 = require("../types/index.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Column CRUD (Project Scoped)
// ===========================================
/**
 * @route   GET /api/v1/projects/:projectId/columns
 * @desc    List columns in project (Kanban board)
 * @access  Private (Project Member)
 */
router.get('/projects/:projectId/columns', (0, auth_middleware_js_1.requireProjectAccess)(), (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.getByProject));
/**
 * @route   POST /api/v1/projects/:projectId/columns
 * @desc    Create a new column
 * @access  Private (Project Manager)
 */
router.post('/projects/:projectId/columns', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.validate)(column_validation_js_1.createColumnSchema), (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.create));
/**
 * @route   POST /api/v1/projects/:projectId/columns/reorder
 * @desc    Reorder columns
 * @access  Private (Project Manager)
 */
router.post('/projects/:projectId/columns/reorder', (0, auth_middleware_js_1.requireProjectAccess)([index_js_1.ProjectRole.MANAGER]), (0, error_middleware_js_1.validate)(column_validation_js_1.reorderColumnsSchema), (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.reorderAll));
// ===========================================
// Individual Column Operations
// ===========================================
/**
 * @route   GET /api/v1/columns/:columnId
 * @desc    Get column with tasks
 * @access  Private (Project Member)
 */
router.get('/:columnId', (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.getById));
/**
 * @route   PATCH /api/v1/columns/:columnId
 * @desc    Update column
 * @access  Private (Project Manager)
 */
router.patch('/:columnId', (0, error_middleware_js_1.validate)(column_validation_js_1.updateColumnSchema), (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.update));
/**
 * @route   DELETE /api/v1/columns/:columnId
 * @desc    Delete column
 * @access  Private (Project Manager)
 */
router.delete('/:columnId', (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.delete));
/**
 * @route   POST /api/v1/columns/:columnId/clear
 * @desc    Clear all tasks in column
 * @access  Private (Project Manager)
 */
router.post('/:columnId/clear', (0, error_middleware_js_1.asyncHandler)(column_controller_js_1.columnController.clearTasks));
exports.default = router;
//# sourceMappingURL=column.routes.js.map