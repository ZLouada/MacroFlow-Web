"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const upload_service_1 = require("./upload.service");
// ===========================================
// Helper: Generate slug
// ===========================================
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
};
const ensureUniqueSlug = async (baseSlug, excludeId) => {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await database_1.prisma.workspace.findFirst({
            where: {
                slug,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });
        if (!existing)
            return slug;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};
// ===========================================
// Workspace Service
// ===========================================
exports.workspaceService = {
    /**
     * Create a new workspace
     */
    async createWorkspace(userId, data) {
        const slug = await ensureUniqueSlug(generateSlug(data.name));
        const workspace = await database_1.prisma.workspace.create({
            data: {
                name: data.name,
                slug,
                icon: data.icon,
                color: data.color,
                isPrivate: data.isPrivate ?? false,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    },
                },
            },
        });
        return workspace;
    },
    /**
     * Get user's workspaces with pagination
     */
    async getUserWorkspaces(userId, options) {
        const { cursor, limit = 20 } = options;
        const memberships = await database_1.prisma.workspaceMember.findMany({
            where: {
                userId,
                workspace: { deletedAt: null },
                ...(cursor && {
                    joinedAt: { lt: new Date(cursor) },
                }),
            },
            take: limit + 1,
            orderBy: { joinedAt: 'desc' },
            include: {
                workspace: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                                projects: true,
                            },
                        },
                    },
                },
            },
        });
        const hasMore = memberships.length > limit;
        const data = hasMore ? memberships.slice(0, -1) : memberships;
        const nextCursor = hasMore ? data[data.length - 1].joinedAt.toISOString() : null;
        return {
            data: data.map((m) => ({
                ...m.workspace,
                role: m.role,
                joinedAt: m.joinedAt,
            })),
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get workspace by ID
     */
    async getWorkspaceById(workspaceId) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    },
                },
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        return workspace;
    },
    /**
     * Update workspace
     */
    async updateWorkspace(workspaceId, data) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        let slug = workspace.slug;
        if (data.name && data.name !== workspace.name) {
            slug = await ensureUniqueSlug(generateSlug(data.name), workspaceId);
        }
        const updated = await database_1.prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...data,
                slug,
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    },
                },
            },
        });
        return updated;
    },
    /**
     * Delete workspace (soft delete)
     */
    async deleteWorkspace(workspaceId) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        await database_1.prisma.workspace.update({
            where: { id: workspaceId },
            data: { deletedAt: new Date() },
        });
    },
    /**
     * Get workspace members with pagination
     */
    async getWorkspaceMembers(workspaceId, options) {
        const { cursor, limit = 20, role } = options;
        const where = {
            workspaceId,
            ...(role && { role: role }),
            ...(cursor && {
                joinedAt: { lt: new Date(cursor) },
            }),
        };
        const members = await database_1.prisma.workspaceMember.findMany({
            where,
            take: limit + 1,
            orderBy: { joinedAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        const hasMore = members.length > limit;
        const data = hasMore ? members.slice(0, -1) : members;
        const nextCursor = hasMore ? data[data.length - 1].joinedAt.toISOString() : null;
        return {
            data: data.map((m) => ({
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                user: m.user,
            })),
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Add member to workspace
     */
    async addMember(workspaceId, data) {
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        let userId = data.userId;
        // If email provided, find user
        if (!userId && data.email) {
            const user = await database_1.prisma.user.findUnique({
                where: { email: data.email.toLowerCase() },
            });
            if (!user) {
                throw new errors_1.NotFoundError('User with this email not found');
            }
            userId = user.id;
        }
        if (!userId) {
            throw new errors_1.BadRequestError('Either userId or email is required');
        }
        // Check if already a member
        const existingMember = await database_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (existingMember) {
            throw new errors_1.ConflictError('User is already a member of this workspace');
        }
        const member = await database_1.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId,
                role: data.role || 'member',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt,
            user: member.user,
        };
    },
    /**
     * Update member role
     */
    async updateMemberRole(workspaceId, userId, role) {
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        // Can't change owner role
        if (workspace.ownerId === userId) {
            throw new errors_1.ForbiddenError('Cannot change owner role');
        }
        // Can't make someone else the owner
        if (role === 'owner') {
            throw new errors_1.ForbiddenError('Cannot assign owner role directly. Use transfer ownership.');
        }
        const member = await database_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_1.NotFoundError('Member not found');
        }
        const updated = await database_1.prisma.workspaceMember.update({
            where: { id: member.id },
            data: { role: role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        return {
            id: updated.id,
            role: updated.role,
            joinedAt: updated.joinedAt,
            user: updated.user,
        };
    },
    /**
     * Remove member from workspace
     */
    async removeMember(workspaceId, userId) {
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        // Owner can't be removed
        if (workspace.ownerId === userId) {
            throw new errors_1.ForbiddenError('Cannot remove workspace owner');
        }
        const member = await database_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_1.NotFoundError('Member not found');
        }
        await database_1.prisma.workspaceMember.delete({
            where: { id: member.id },
        });
    },
    /**
     * Leave workspace
     */
    async leaveWorkspace(workspaceId, userId) {
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        // Owner can't leave
        if (workspace.ownerId === userId) {
            throw new errors_1.ForbiddenError('Owner cannot leave workspace. Transfer ownership or delete the workspace.');
        }
        const member = await database_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_1.NotFoundError('You are not a member of this workspace');
        }
        await database_1.prisma.workspaceMember.delete({
            where: { id: member.id },
        });
    },
    /**
     * Transfer workspace ownership
     */
    async transferOwnership(workspaceId, currentOwnerId, newOwnerId) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                ownerId: currentOwnerId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found or you are not the owner');
        }
        // Check if new owner is a member
        const newOwnerMember = await database_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: newOwnerId,
                },
            },
        });
        if (!newOwnerMember) {
            throw new errors_1.BadRequestError('New owner must be a member of the workspace');
        }
        // Update workspace owner and member roles
        await database_1.prisma.$transaction([
            database_1.prisma.workspace.update({
                where: { id: workspaceId },
                data: { ownerId: newOwnerId },
            }),
            database_1.prisma.workspaceMember.update({
                where: { id: newOwnerMember.id },
                data: { role: 'owner' },
            }),
            database_1.prisma.workspaceMember.updateMany({
                where: {
                    workspaceId,
                    userId: currentOwnerId,
                },
                data: { role: 'admin' },
            }),
        ]);
        return this.getWorkspaceById(workspaceId);
    },
    /**
     * Create invite link
     */
    async createInviteLink(workspaceId, options) {
        const workspace = await database_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        const inviteCode = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + (options.expiresIn || 7 * 24 * 60 * 60 * 1000)); // Default 7 days
        // Store invite in a simple way - we'll use the workspace's settings or create a WorkspaceInvite model
        // For now, we'll return the code that can be validated on join
        // In production, this should be stored in a separate table
        return {
            inviteCode,
            workspaceId,
            role: options.role || 'member',
            expiresAt,
            inviteUrl: `/workspaces/join/${inviteCode}`,
        };
    },
    /**
     * Join workspace via invite code
     */
    async joinViaInvite(inviteCode, userId) {
        // In a real implementation, you'd look up the invite code in a database table
        // For now, we'll assume invite codes are valid and decode the workspace ID from them
        // This is a simplified implementation
        throw new errors_1.BadRequestError('Invite system requires additional setup. Please have an admin add you directly.');
    },
    /**
     * Get workspace projects
     */
    async getWorkspaceProjects(workspaceId, options) {
        const { cursor, limit = 20, status } = options;
        const where = {
            workspaceId,
            deletedAt: null,
            ...(status && { status: status }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const projects = await database_1.prisma.project.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
        });
        const hasMore = projects.length > limit;
        const data = hasMore ? projects.slice(0, -1) : projects;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get workspace activity
     */
    async getWorkspaceActivity(workspaceId, options) {
        const { cursor, limit = 20, type } = options;
        const where = {
            workspaceId,
            ...(type && { action: type }),
            ...(cursor && {
                createdAt: { lt: new Date(cursor) },
            }),
        };
        const activities = await database_1.prisma.activity.findMany({
            where,
            take: limit + 1,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        const hasMore = activities.length > limit;
        const data = hasMore ? activities.slice(0, -1) : activities;
        const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;
        return {
            data,
            pagination: {
                hasMore,
                nextCursor,
            },
        };
    },
    /**
     * Get workspace settings
     */
    async getWorkspaceSettings(workspaceId) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
                isPrivate: true,
                isPremium: true,
                isPersonal: true,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        return workspace;
    },
    /**
     * Update workspace settings
     */
    async updateWorkspaceSettings(workspaceId, data) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        const updated = await database_1.prisma.workspace.update({
            where: { id: workspaceId },
            data,
            select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
                isPrivate: true,
                isPremium: true,
                isPersonal: true,
            },
        });
        return updated;
    },
    /**
     * Update workspace logo
     */
    async updateWorkspaceLogo(workspaceId, file) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        // Delete old icon if exists
        if (workspace.icon) {
            await upload_service_1.uploadService.deleteFile(workspace.icon).catch(() => { });
        }
        // Upload new logo
        const result = await upload_service_1.uploadService.uploadFile(file, 'workspace-logos');
        await database_1.prisma.workspace.update({
            where: { id: workspaceId },
            data: { icon: result.url },
        });
        return { logoUrl: result.url };
    },
    /**
     * Get workspace statistics
     */
    async getWorkspaceStats(workspaceId) {
        const workspace = await database_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
        });
        if (!workspace) {
            throw new errors_1.NotFoundError('Workspace not found');
        }
        const [memberCount, projectCount, taskStats, recentActivity] = await Promise.all([
            database_1.prisma.workspaceMember.count({ where: { workspaceId } }),
            database_1.prisma.project.count({ where: { workspaceId, deletedAt: null } }),
            database_1.prisma.task.groupBy({
                by: ['status'],
                where: {
                    project: { workspaceId },
                    deletedAt: null,
                },
                _count: true,
            }),
            database_1.prisma.activity.count({
                where: {
                    workspaceId,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);
        const tasksByStatus = taskStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count;
            return acc;
        }, {});
        const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
        return {
            members: memberCount,
            projects: projectCount,
            totalTasks,
            tasksByStatus,
            recentActivityCount: recentActivity,
        };
    },
};
exports.default = exports.workspaceService;
//# sourceMappingURL=workspace.service.js.map