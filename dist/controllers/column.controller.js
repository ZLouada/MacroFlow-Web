"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnController = void 0;
const column_service_1 = require("../services/column.service");
const errors_1 = require("../utils/errors");
exports.columnController = {
    /**
     * Create a new column
     * POST /api/v1/projects/:projectId/columns
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { projectId } = req.params;
            const column = await column_service_1.columnService.createColumn(projectId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Column created successfully',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get columns for project
     * GET /api/v1/projects/:projectId/columns
     */
    async getByProject(req, res, next) {
        try {
            const { projectId } = req.params;
            const columns = await column_service_1.columnService.getColumnsByProject(projectId);
            res.json({
                success: true,
                data: columns,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get column by ID
     * GET /api/v1/columns/:columnId
     */
    async getById(req, res, next) {
        try {
            const { columnId } = req.params;
            const column = await column_service_1.columnService.getColumnById(columnId);
            res.json({
                success: true,
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update column
     * PATCH /api/v1/columns/:columnId
     */
    async update(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const column = await column_service_1.columnService.updateColumn(columnId, req.user.id, req.body);
            res.json({
                success: true,
                message: 'Column updated successfully',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete column
     * DELETE /api/v1/columns/:columnId
     */
    async delete(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { moveTasksToColumnId } = req.query;
            await column_service_1.columnService.deleteColumn(columnId, req.user.id, moveTasksToColumnId);
            res.json({
                success: true,
                message: 'Column deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Reorder column
     * POST /api/v1/columns/:columnId/reorder
     */
    async reorder(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { position } = req.body;
            const column = await column_service_1.columnService.reorderColumn(columnId, req.user.id, position);
            res.json({
                success: true,
                message: 'Column reordered successfully',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Reorder all columns in project
     * POST /api/v1/projects/:projectId/columns/reorder
     */
    async reorderAll(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { projectId } = req.params;
            const { columnIds } = req.body;
            const columns = await column_service_1.columnService.reorderAllColumns(projectId, req.user.id, columnIds);
            res.json({
                success: true,
                message: 'Columns reordered successfully',
                data: columns,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get tasks in column
     * GET /api/v1/columns/:columnId/tasks
     */
    async getTasks(req, res, next) {
        try {
            const { columnId } = req.params;
            const { cursor, limit } = req.query;
            const result = await column_service_1.columnService.getColumnTasks(columnId, {
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
     * Set column WIP limit
     * PATCH /api/v1/columns/:columnId/wip-limit
     */
    async setWipLimit(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { limit: wipLimit } = req.body;
            const column = await column_service_1.columnService.setWipLimit(columnId, req.user.id, wipLimit);
            res.json({
                success: true,
                message: 'WIP limit updated successfully',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Set column color
     * PATCH /api/v1/columns/:columnId/color
     */
    async setColor(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { color } = req.body;
            const column = await column_service_1.columnService.setColumnColor(columnId, req.user.id, color);
            res.json({
                success: true,
                message: 'Column color updated successfully',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Collapse/expand column
     * POST /api/v1/columns/:columnId/toggle-collapse
     */
    async toggleCollapse(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { collapsed } = req.body;
            const column = await column_service_1.columnService.toggleCollapse(columnId, req.user.id, collapsed);
            res.json({
                success: true,
                message: collapsed ? 'Column collapsed' : 'Column expanded',
                data: column,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Clear all tasks from column
     * POST /api/v1/columns/:columnId/clear
     */
    async clearTasks(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { columnId } = req.params;
            const { archive } = req.body;
            const count = await column_service_1.columnService.clearColumn(columnId, req.user.id, archive);
            res.json({
                success: true,
                message: archive
                    ? `${count} tasks archived successfully`
                    : `${count} tasks deleted successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=column.controller.js.map