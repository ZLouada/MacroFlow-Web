"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
exports.searchService = {
    // Get user's accessible workspace IDs
    async getUserWorkspaceIds(userId, workspaceId) {
        const userWorkspaces = await database_1.prisma.workspaceMember.findMany({
            where: { userId },
            select: { workspaceId: true },
        });
        return workspaceId ? [workspaceId] : userWorkspaces.map(w => w.workspaceId);
    },
    // Global search across all resources
    async globalSearch(userId, params) {
        const { query, types = ['task', 'project', 'user'], workspaceId, limit = 20 } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const results = {
            tasks: [],
            projects: [],
            users: [],
        };
        // Search tasks
        if (types.includes('task') || types.includes('all')) {
            const tasks = await database_1.prisma.task.findMany({
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
                    project: { select: { id: true, name: true, workspaceId: true } },
                    assignee: { select: { id: true, name: true, avatar: true } },
                },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
            results.tasks = tasks.map(t => ({
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
        if (types.includes('project') || types.includes('all')) {
            const projects = await database_1.prisma.project.findMany({
                where: {
                    workspaceId: { in: workspaceIds },
                    deletedAt: null,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    workspace: { select: { id: true, name: true } },
                    _count: { select: { tasks: true, members: true } },
                },
                take: limit,
                orderBy: { updatedAt: 'desc' },
            });
            results.projects = projects.map(p => ({
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
        if (types.includes('user') || types.includes('all')) {
            const users = await database_1.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    workspaces: {
                        some: { workspaceId: { in: workspaceIds } },
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
            results.users = users.map(u => ({
                id: u.id,
                type: 'user',
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                role: u.role,
            }));
        }
        // Track this search
        await this.trackRecentSearch(userId, query);
        return results;
    },
    // Search tasks with advanced filters
    async searchTasks(userId, params) {
        const { query, workspaceId, projectId, status, priority, assigneeId, labels, dueBefore, dueAfter, cursor, limit = 20, } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const where = {
            deletedAt: null,
            project: {
                workspaceId: { in: workspaceIds },
                deletedAt: null,
                ...(projectId && { id: projectId }),
            },
            ...(query && {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            }),
            ...(status && { status: status }),
            ...(priority && { priority: priority }),
            ...(assigneeId && { assigneeId }),
            ...(labels && labels.length > 0 && {
                labels: {
                    some: { labelId: { in: labels } },
                },
            }),
            ...(dueBefore && { dueDate: { lte: new Date(dueBefore) } }),
            ...(dueAfter && { dueDate: { gte: new Date(dueAfter) } }),
        };
        const tasks = await database_1.prisma.task.findMany({
            where,
            include: {
                project: { select: { id: true, name: true, workspaceId: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
                labels: {
                    include: { label: { select: { id: true, name: true, color: true } } },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasNext = tasks.length > limit;
        if (hasNext)
            tasks.pop();
        const nextCursor = hasNext ? tasks[tasks.length - 1]?.id : undefined;
        return {
            data: tasks,
            pagination: { hasNext, nextCursor, limit },
        };
    },
    // Search projects
    async searchProjects(userId, params) {
        const { query, workspaceId, status, cursor, limit = 20 } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const where = {
            workspaceId: { in: workspaceIds },
            deletedAt: null,
            ...(query && {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            }),
            ...(status && { status: status }),
        };
        const projects = await database_1.prisma.project.findMany({
            where,
            include: {
                workspace: { select: { id: true, name: true } },
                _count: { select: { tasks: true, members: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasNext = projects.length > limit;
        if (hasNext)
            projects.pop();
        const nextCursor = hasNext ? projects[projects.length - 1]?.id : undefined;
        return {
            data: projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                status: p.status,
                workspace: p.workspace,
                tasksCount: p._count.tasks,
                membersCount: p._count.members,
                updatedAt: p.updatedAt,
            })),
            pagination: { hasNext, nextCursor, limit },
        };
    },
    // Search users
    async searchUsers(userId, params) {
        const { query, workspaceId, limit = 20 } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const users = await database_1.prisma.user.findMany({
            where: {
                deletedAt: null,
                workspaces: {
                    some: { workspaceId: { in: workspaceIds } },
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
        return users;
    },
    // Search comments
    async searchComments(userId, params) {
        const { query, workspaceId, projectId, taskId, cursor, limit = 20 } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const where = {
            content: { contains: query, mode: 'insensitive' },
            task: {
                deletedAt: null,
                ...(taskId && { id: taskId }),
                project: {
                    deletedAt: null,
                    workspaceId: { in: workspaceIds },
                    ...(projectId && { id: projectId }),
                },
            },
        };
        const comments = await database_1.prisma.comment.findMany({
            where,
            include: {
                author: { select: { id: true, name: true, avatar: true } },
                task: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasNext = comments.length > limit;
        if (hasNext)
            comments.pop();
        const nextCursor = hasNext ? comments[comments.length - 1]?.id : undefined;
        return {
            data: comments,
            pagination: { hasNext, nextCursor, limit },
        };
    },
    // Get search suggestions (autocomplete)
    async getSuggestions(userId, params) {
        const { query, types = ['task', 'project', 'user'], workspaceId, limit = 10 } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        const suggestions = [];
        // Get task suggestions
        if (types.includes('task')) {
            const tasks = await database_1.prisma.task.findMany({
                where: {
                    deletedAt: null,
                    project: {
                        workspaceId: { in: workspaceIds },
                        deletedAt: null,
                    },
                    title: { contains: query, mode: 'insensitive' },
                },
                select: {
                    id: true,
                    title: true,
                    project: { select: { name: true } },
                },
                take: limit,
            });
            tasks.forEach(t => {
                suggestions.push({
                    id: t.id,
                    type: 'task',
                    text: t.title,
                    subtext: t.project.name,
                });
            });
        }
        // Get project suggestions
        if (types.includes('project')) {
            const projects = await database_1.prisma.project.findMany({
                where: {
                    workspaceId: { in: workspaceIds },
                    deletedAt: null,
                    name: { contains: query, mode: 'insensitive' },
                },
                select: {
                    id: true,
                    name: true,
                    workspace: { select: { name: true } },
                },
                take: limit,
            });
            projects.forEach(p => {
                suggestions.push({
                    id: p.id,
                    type: 'project',
                    text: p.name,
                    subtext: p.workspace.name,
                });
            });
        }
        // Get user suggestions
        if (types.includes('user')) {
            const users = await database_1.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    workspaces: {
                        some: { workspaceId: { in: workspaceIds } },
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
                },
                take: limit,
            });
            users.forEach(u => {
                suggestions.push({
                    id: u.id,
                    type: 'user',
                    text: u.name,
                    subtext: u.email,
                });
            });
        }
        return suggestions.slice(0, limit);
    },
    // Track recent search (stored in Redis)
    async trackRecentSearch(userId, query) {
        if (!query || query.length < 2)
            return;
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:recent:${userId}`;
            // Get existing searches
            const existing = await redis.lrange(key, 0, -1);
            // Remove duplicates and add new search
            const filtered = existing.filter(s => s !== query);
            filtered.unshift(query);
            // Keep only last 20 searches
            const trimmed = filtered.slice(0, 20);
            await redis.del(key);
            if (trimmed.length > 0) {
                await redis.rpush(key, ...trimmed);
                await redis.expire(key, 60 * 60 * 24 * 30); // 30 days
            }
        }
        catch {
            // Redis not available
        }
    },
    // Get recent searches
    async getRecentSearches(userId, params = {}) {
        const { limit = 10 } = params;
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:recent:${userId}`;
            const searches = await redis.lrange(key, 0, limit - 1);
            return searches.map((query, index) => ({
                id: `recent-${index}`,
                query,
            }));
        }
        catch {
            return [];
        }
    },
    // Clear recent searches
    async clearRecentSearches(userId) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:recent:${userId}`;
            await redis.del(key);
        }
        catch {
            // Redis not available
        }
    },
    // Save search (stored in Redis)
    async saveSearch(userId, params) {
        const { name, query, filters = {} } = params;
        const id = `saved-${Date.now()}`;
        const savedSearch = {
            id,
            name,
            query,
            filters,
            createdAt: new Date(),
        };
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:saved:${userId}`;
            const existing = await redis.get(key);
            const searches = existing ? JSON.parse(existing) : [];
            searches.push(savedSearch);
            await redis.set(key, JSON.stringify(searches));
        }
        catch {
            // Redis not available - could store in database instead
        }
        return savedSearch;
    },
    // Get saved searches
    async getSavedSearches(userId) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:saved:${userId}`;
            const data = await redis.get(key);
            return data ? JSON.parse(data) : [];
        }
        catch {
            return [];
        }
    },
    // Delete saved search
    async deleteSavedSearch(userId, searchId) {
        try {
            const redis = (0, redis_1.getRedisClient)();
            const key = `search:saved:${userId}`;
            const existing = await redis.get(key);
            if (existing) {
                const searches = JSON.parse(existing);
                const filtered = searches.filter(s => s.id !== searchId);
                await redis.set(key, JSON.stringify(filtered));
            }
        }
        catch {
            // Redis not available
        }
    },
    // Advanced search with complex filters and facets
    async advancedSearch(userId, params) {
        const { query, types = ['task'], workspaceId, projectId, filters = {}, sort = { field: 'updatedAt', direction: 'desc' }, cursor, limit = 20, } = params;
        const workspaceIds = await this.getUserWorkspaceIds(userId, workspaceId);
        // Currently only support task search in advanced mode
        const where = {
            deletedAt: null,
            project: {
                workspaceId: { in: workspaceIds },
                deletedAt: null,
                ...(projectId && { id: projectId }),
            },
            ...(query && {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            }),
            ...(filters.status && filters.status.length > 0 && {
                status: { in: filters.status },
            }),
            ...(filters.priority && filters.priority.length > 0 && {
                priority: { in: filters.priority },
            }),
            ...(filters.assigneeId && filters.assigneeId.length > 0 && {
                assigneeId: { in: filters.assigneeId },
            }),
            ...(filters.labels && filters.labels.length > 0 && {
                labels: { some: { labelId: { in: filters.labels } } },
            }),
            ...(filters.dateRange && {
                [filters.dateRange.field]: {
                    ...(filters.dateRange.from && { gte: new Date(filters.dateRange.from) }),
                    ...(filters.dateRange.to && { lte: new Date(filters.dateRange.to) }),
                },
            }),
        };
        const orderBy = {
            [sort.field]: sort.direction,
        };
        const tasks = await database_1.prisma.task.findMany({
            where,
            include: {
                project: { select: { id: true, name: true, workspaceId: true } },
                assignee: { select: { id: true, name: true, avatar: true } },
                labels: {
                    include: { label: { select: { id: true, name: true, color: true } } },
                },
            },
            orderBy,
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasNext = tasks.length > limit;
        if (hasNext)
            tasks.pop();
        const nextCursor = hasNext ? tasks[tasks.length - 1]?.id : undefined;
        // Calculate facets (counts for filtering)
        const [statusCounts, priorityCounts] = await Promise.all([
            database_1.prisma.task.groupBy({
                by: ['status'],
                where: { ...where, status: undefined },
                _count: true,
            }),
            database_1.prisma.task.groupBy({
                by: ['priority'],
                where: { ...where, priority: undefined },
                _count: true,
            }),
        ]);
        return {
            data: tasks,
            pagination: { hasNext, nextCursor, limit },
            facets: {
                status: statusCounts.map(s => ({ value: s.status, count: s._count })),
                priority: priorityCounts.map(p => ({ value: p.priority, count: p._count })),
            },
        };
    },
};
exports.default = exports.searchService;
//# sourceMappingURL=search.service.js.map