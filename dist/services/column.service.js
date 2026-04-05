"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.columnService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
// ===========================================
// Column Service
// ===========================================
exports.columnService = {
    // Get columns for project
    async getColumns(projectId, includeTasks = false) {
        const columns = await database_js_1.prisma.kanbanColumn.findMany({
            where: { projectId },
            orderBy: { order: 'asc' },
            include: includeTasks
                ? {
                    tasks: {
                        where: { deletedAt: null },
                        orderBy: { order: 'asc' },
                        include: {
                            assignee: {
                                select: { id: true, name: true, avatar: true },
                            },
                            labels: {
                                include: { label: true },
                            },
                            _count: {
                                select: { comments: true, attachments: true },
                            },
                        },
                    },
                }
                : undefined,
        });
        return columns;
    },
    // Create column
    async createColumn(projectId, data) {
        // Get max order
        const maxOrder = await database_js_1.prisma.kanbanColumn.aggregate({
            where: { projectId },
            _max: { order: true },
        });
        const column = await database_js_1.prisma.kanbanColumn.create({
            data: {
                projectId,
                title: data.title,
                status: data.status,
                color: data.color,
                taskLimit: data.taskLimit,
                order: (maxOrder._max.order || 0) + 1,
            },
        });
        return column;
    },
    // Update column
    async updateColumn(columnId, data) {
        const column = await database_js_1.prisma.kanbanColumn.findUnique({
            where: { id: columnId },
        });
        if (!column) {
            throw new errors_js_1.NotFoundError('Column not found');
        }
        const updated = await database_js_1.prisma.kanbanColumn.update({
            where: { id: columnId },
            data,
        });
        return updated;
    },
    // Delete column
    async deleteColumn(columnId, moveTasksTo) {
        const column = await database_js_1.prisma.kanbanColumn.findUnique({
            where: { id: columnId },
            include: {
                _count: { select: { tasks: true } },
            },
        });
        if (!column) {
            throw new errors_js_1.NotFoundError('Column not found');
        }
        // If column has tasks, require target column
        if (column._count.tasks > 0) {
            if (!moveTasksTo) {
                throw new errors_js_1.NotFoundError('Column has tasks. Specify a target column to move them to.');
            }
            // Move tasks to target column
            await database_js_1.prisma.task.updateMany({
                where: { columnId },
                data: { columnId: moveTasksTo },
            });
        }
        await database_js_1.prisma.kanbanColumn.delete({
            where: { id: columnId },
        });
    },
    // Reorder columns
    async reorderColumns(projectId, data) {
        const updates = data.columnIds.map((columnId, index) => database_js_1.prisma.kanbanColumn.update({
            where: { id: columnId },
            data: { order: index },
        }));
        await database_js_1.prisma.$transaction(updates);
        return this.getColumns(projectId);
    },
};
exports.default = exports.columnService;
//# sourceMappingURL=column.service.js.map