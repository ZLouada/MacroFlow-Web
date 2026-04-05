"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = void 0;
const database_js_1 = require("../config/database.js");
exports.searchService = {
    // Global search
    async search(userId, params) {
        const { query, type = 'all', workspaceId, limit = 20 } = params;
        const results = {
            tasks: [],
            projects: [],
            users: [],
        };
        // Get user's workspace IDs for access control
        const userWorkspaces = await database_js_1.prisma.workspaceMember.findMany({
            where: { userId },
            select: { workspaceId: true },
        });
        const workspaceIds = workspaceId
            ? [workspaceId]
            : userWorkspaces.map((w) => w.workspaceId);
        // Search tasks
        if (type === 'all' || type === 'task') {
            const tasks = await database_js_1.prisma.task.findMany({
                where: {
                    deletedAt: null,
                    project: {
                        workspaceId: { in: workspaceIds },
                        deletedAt: null,
                    },
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    project: {
                        select: { id: true, name: true, workspaceId: true },
                    },
                    assignee: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
            results.tasks = tasks.map((t) => ({
                id: t.id,
                type: 'task',
                title: t.title,
                description: t.description?.substring(0, 200),
                status: t.status,
                priority: t.priority,
                project: t.project,
                assignee: t.assignee,
                updatedAt: t.updatedAt,
            }));
        }
        // Search projects
        if (type === 'all' || type === 'project') {
            const projects = await database_js_1.prisma.project.findMany({
                where: {
                    workspaceId: { in: workspaceIds },
                    deletedAt: null,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    workspace: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: { tasks: true, members: true },
                    },
                },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
            results.projects = projects.map((p) => ({
                id: p.id,
                type: 'project',
                name: p.name,
                description: p.description?.substring(0, 200),
                status: p.status,
                workspace: p.workspace,
                tasksCount: p._count.tasks,
                membersCount: p._count.members,
                updatedAt: p.updatedAt,
            }));
        }
        // Search users
        if (type === 'all' || type === 'user') {
            const users = await database_js_1.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    // Only search users in same workspaces
                    workspaces: {
                        some: {
                            workspaceId: { in: workspaceIds },
                        },
                    },
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    role: true,
                },
                take: limit,
            });
            results.users = users.map((u) => ({
                id: u.id,
                type: 'user',
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                role: u.role,
            }));
        }
        return results;
    },
    // Quick search for autocomplete
    async quickSearch(userId, query, workspaceId) {
        if (!query || query.length < 2) {
            return { tasks: [], projects: [], users: [] };
        }
        return this.search(userId, {
            query,
            type: 'all',
            workspaceId,
            limit: 5,
        });
    },
};
exports.default = exports.searchService;
//# sourceMappingURL=search.service.js.map