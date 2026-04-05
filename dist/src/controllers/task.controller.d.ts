import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const taskController: {
    /**
     * Get tasks by project
     * GET /api/v1/projects/:projectId/tasks
     */
    getByProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create a new task
     * POST /api/v1/projects/:projectId/tasks
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get task by ID
     * GET /api/v1/tasks/:taskId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update task
     * PATCH /api/v1/tasks/:taskId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete task (soft delete)
     * DELETE /api/v1/tasks/:taskId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Move task to column
     * POST /api/v1/tasks/:taskId/move
     */
    move(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reorder task within column
     * POST /api/v1/tasks/:taskId/reorder
     */
    reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Assign user to task
     * POST /api/v1/tasks/:taskId/assign
     */
    assign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unassign user from task
     * POST /api/v1/tasks/:taskId/unassign
     */
    unassign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add label to task
     * POST /api/v1/tasks/:taskId/labels
     */
    addLabel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove label from task
     * DELETE /api/v1/tasks/:taskId/labels/:labelId
     */
    removeLabel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Add dependency to task
     * POST /api/v1/tasks/:taskId/dependencies
     */
    addDependency(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Remove dependency from task
     * DELETE /api/v1/tasks/:taskId/dependencies/:dependencyId
     */
    removeDependency(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get task comments
     * GET /api/v1/tasks/:taskId/comments
     */
    getComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get task attachments
     * GET /api/v1/tasks/:taskId/attachments
     */
    getAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Upload attachment to task
     * POST /api/v1/tasks/:taskId/attachments
     */
    uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete attachment from task
     * DELETE /api/v1/tasks/:taskId/attachments/:attachmentId
     */
    deleteAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get task activity/history
     * GET /api/v1/tasks/:taskId/activity
     */
    getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Create subtask
     * POST /api/v1/tasks/:taskId/subtasks
     */
    createSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get subtasks
     * GET /api/v1/tasks/:taskId/subtasks
     */
    getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Duplicate task
     * POST /api/v1/tasks/:taskId/duplicate
     */
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Watch/subscribe to task
     * POST /api/v1/tasks/:taskId/watch
     */
    watch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Unwatch/unsubscribe from task
     * DELETE /api/v1/tasks/:taskId/watch
     */
    unwatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Log time on task
     * POST /api/v1/tasks/:taskId/time-logs
     */
    logTime(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get time logs for task
     * GET /api/v1/tasks/:taskId/time-logs
     */
    getTimeLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk update tasks
     * PATCH /api/v1/tasks/bulk
     */
    bulkUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Bulk delete tasks
     * DELETE /api/v1/tasks/bulk
     */
    bulkDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=task.controller.d.ts.map