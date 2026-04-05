"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = void 0;
const project_service_1 = require("../services/project.service");
const errors_1 = require("../utils/errors");
exports.projectController = {
    /**
     * Create a new project
     * POST /api/v1/workspaces/:workspaceId/projects
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { workspaceId } = req.params;
            const project = await project_service_1.projectService.createProject(workspaceId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project by ID
     * GET /api/v1/projects/:projectId
     */
    async getById(req, res, next) {
        try {
            const { projectId } = req.params;
            const project = await project_service_1.projectService.getProjectById(projectId);
            res.json({
                success: true,
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update project
     * PATCH /api/v1/projects/:projectId
     */
    async update(req, res, next) {
        try {
            const { projectId } = req.params;
            const project = await project_service_1.projectService.updateProject(projectId, req.body);
            res.json({
                success: true,
                message: 'Project updated successfully',
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete project (soft delete)
     * DELETE /api/v1/projects/:projectId
     */
    async delete(req, res, next) {
        try {
            const { projectId } = req.params;
            await project_service_1.projectService.deleteProject(projectId);
            res.json({
                success: true,
                message: 'Project deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project members
     * GET /api/v1/projects/:projectId/members
     */
    async getMembers(req, res, next) {
        try {
            const { projectId } = req.params;
            const { cursor, limit, role } = req.query;
            const result = await project_service_1.projectService.getProjectMembers(projectId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                role: role,
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
     * Add member to project
     * POST /api/v1/projects/:projectId/members
     */
    async addMember(req, res, next) {
        try {
            const { projectId } = req.params;
            const { userId, role } = req.body;
            const member = await project_service_1.projectService.addMember(projectId, userId, role);
            res.status(201).json({
                success: true,
                message: 'Member added successfully',
                data: member,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update member role in project
     * PATCH /api/v1/projects/:projectId/members/:userId
     */
    async updateMemberRole(req, res, next) {
        try {
            const { projectId, userId } = req.params;
            const { role } = req.body;
            const member = await project_service_1.projectService.updateMemberRole(projectId, userId, role);
            res.json({
                success: true,
                message: 'Member role updated successfully',
                data: member,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Remove member from project
     * DELETE /api/v1/projects/:projectId/members/:userId
     */
    async removeMember(req, res, next) {
        try {
            const { projectId, userId } = req.params;
            await project_service_1.projectService.removeMember(projectId, userId);
            res.json({
                success: true,
                message: 'Member removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project tasks
     * GET /api/v1/projects/:projectId/tasks
     */
    async getTasks(req, res, next) {
        try {
            const { projectId } = req.params;
            const { cursor, limit, status, priority, assigneeId, columnId, labels, search } = req.query;
            const result = await project_service_1.projectService.getProjectTasks(projectId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                status: status,
                priority: priority,
                assigneeId: assigneeId,
                columnId: columnId,
                labels: labels ? labels.split(',') : undefined,
                search: search,
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
     * Get project board (Kanban view)
     * GET /api/v1/projects/:projectId/board
     */
    async getBoard(req, res, next) {
        try {
            const { projectId } = req.params;
            const board = await project_service_1.projectService.getProjectBoard(projectId);
            res.json({
                success: true,
                data: board,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project Gantt data
     * GET /api/v1/projects/:projectId/gantt
     */
    async getGantt(req, res, next) {
        try {
            const { projectId } = req.params;
            const { startDate, endDate } = req.query;
            const gantt = await project_service_1.projectService.getProjectGantt(projectId, {
                startDate: startDate,
                endDate: endDate,
            });
            res.json({
                success: true,
                data: gantt,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get project activity
     * GET /api/v1/projects/:projectId/activity
     */
    async getActivity(req, res, next) {
        try {
            const { projectId } = req.params;
            const { cursor, limit, type } = req.query;
            const result = await project_service_1.projectService.getProjectActivity(projectId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                type: type,
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
     * Get project labels
     * GET /api/v1/projects/:projectId/labels
     */
    async getLabels(req, res, next) {
        try {
            const { projectId } = req.params;
            const labels = await project_service_1.projectService.getProjectLabels(projectId);
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
     * Get project statistics
     * GET /api/v1/projects/:projectId/stats
     */
    async getStats(req, res, next) {
        try {
            const { projectId } = req.params;
            const stats = await project_service_1.projectService.getProjectStats(projectId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Duplicate project
     * POST /api/v1/projects/:projectId/duplicate
     */
    async duplicate(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { projectId } = req.params;
            const { name, includeMembers, includeTasks } = req.body;
            const project = await project_service_1.projectService.duplicateProject(projectId, req.user.id, {
                name,
                includeMembers,
                includeTasks,
            });
            res.status(201).json({
                success: true,
                message: 'Project duplicated successfully',
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Archive project
     * POST /api/v1/projects/:projectId/archive
     */
    async archive(req, res, next) {
        try {
            const { projectId } = req.params;
            const project = await project_service_1.projectService.archiveProject(projectId);
            res.json({
                success: true,
                message: 'Project archived successfully',
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Unarchive project
     * POST /api/v1/projects/:projectId/unarchive
     */
    async unarchive(req, res, next) {
        try {
            const { projectId } = req.params;
            const project = await project_service_1.projectService.unarchiveProject(projectId);
            res.json({
                success: true,
                message: 'Project unarchived successfully',
                data: project,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update project settings
     * PATCH /api/v1/projects/:projectId/settings
     */
    async updateSettings(req, res, next) {
        try {
            const { projectId } = req.params;
            const settings = await project_service_1.projectService.updateProjectSettings(projectId, req.body);
            res.json({
                success: true,
                message: 'Project settings updated successfully',
                data: settings,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=project.controller.js.map