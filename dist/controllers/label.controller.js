"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labelController = void 0;
const comment_service_1 = require("../services/comment.service");
const errors_1 = require("../utils/errors");
exports.labelController = {
    /**
     * Create a label for a project
     * POST /api/v1/projects/:projectId/labels
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { projectId } = req.params;
            const label = await comment_service_1.labelService.createLabel(projectId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Label created successfully',
                data: label,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get all labels for a project
     * GET /api/v1/projects/:projectId/labels
     */
    async getByProject(req, res, next) {
        try {
            const { projectId } = req.params;
            const labels = await comment_service_1.labelService.getLabelsByProject(projectId);
            res.json({
                success: true,
                data: labels,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get label by ID
     * GET /api/v1/labels/:labelId
     */
    async getById(req, res, next) {
        try {
            const { labelId } = req.params;
            const label = await comment_service_1.labelService.getLabelById(labelId);
            res.json({
                success: true,
                data: label,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update label
     * PATCH /api/v1/labels/:labelId
     */
    async update(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { labelId } = req.params;
            const label = await comment_service_1.labelService.updateLabel(labelId, req.user.id, req.body);
            res.json({
                success: true,
                message: 'Label updated successfully',
                data: label,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete label
     * DELETE /api/v1/labels/:labelId
     */
    async delete(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { labelId } = req.params;
            await comment_service_1.labelService.deleteLabel(labelId, req.user.id);
            res.json({
                success: true,
                message: 'Label deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get tasks with a specific label
     * GET /api/v1/labels/:labelId/tasks
     */
    async getTasks(req, res, next) {
        try {
            const { labelId } = req.params;
            const { cursor, limit } = req.query;
            const result = await comment_service_1.labelService.getTasksWithLabel(labelId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Merge labels
     * POST /api/v1/labels/:labelId/merge
     */
    async merge(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { labelId } = req.params;
            const { targetLabelId } = req.body;
            const label = await comment_service_1.labelService.mergeLabels(labelId, targetLabelId, req.user.id);
            res.json({
                success: true,
                message: 'Labels merged successfully',
                data: label,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Bulk add labels to tasks
     * POST /api/v1/labels/:labelId/bulk-add
     */
    async bulkAdd(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { labelId } = req.params;
            const { taskIds } = req.body;
            const count = await comment_service_1.labelService.bulkAddLabelToTasks(labelId, taskIds, req.user.id);
            res.json({
                success: true,
                message: `Label added to ${count} tasks`,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Bulk remove labels from tasks
     * POST /api/v1/labels/:labelId/bulk-remove
     */
    async bulkRemove(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { labelId } = req.params;
            const { taskIds } = req.body;
            const count = await comment_service_1.labelService.bulkRemoveLabelFromTasks(labelId, taskIds, req.user.id);
            res.json({
                success: true,
                message: `Label removed from ${count} tasks`,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=label.controller.js.map