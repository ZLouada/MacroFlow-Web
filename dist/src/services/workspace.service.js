"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const email_service_js_1 = require("./email.service.js");
const activity_service_js_1 = require("./activity.service.js");
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
        const existing = await database_js_1.prisma.workspace.findFirst({
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
    // List user's workspaces
    async listWorkspaces(userId) {
        const memberships = await database_js_1.prisma.workspaceMember.findMany({
            where: { userId },
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
            orderBy: {
                workspace: { updatedAt: 'desc' },
            },
        });
        return memberships.map((m) => ({
            ...m.workspace,
            role: m.role,
            membersCount: m.workspace._count.members,
            projectsCount: m.workspace._count.projects,
        }));
    },
    // Create workspace
    async createWorkspace(userId, data) {
        const slug = await ensureUniqueSlug(generateSlug(data.name));
        const workspace = await database_js_1.prisma.workspace.create({
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
                members: {
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
                },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: workspace.id,
            userId,
            action: 'created',
            entityType: 'workspace',
            entityId: workspace.id,
        });
        return workspace;
    },
    // Get workspace by ID
    async getWorkspace(workspaceId, userId) {
        const workspace = await database_js_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
                members: {
                    some: { userId },
                },
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        return {
            ...workspace,
            membersCount: workspace._count.members,
            projectsCount: workspace._count.projects,
        };
    },
    // Update workspace
    async updateWorkspace(workspaceId, userId, data) {
        const workspace = await database_js_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
            },
            include: {
                members: {
                    where: { userId },
                },
            },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        const member = workspace.members[0];
        if (!member || !['owner', 'admin'].includes(member.role)) {
            throw new errors_js_1.ForbiddenError('Only owners and admins can update workspace');
        }
        let slug = workspace.slug;
        if (data.name && data.name !== workspace.name) {
            slug = await ensureUniqueSlug(generateSlug(data.name), workspaceId);
        }
        const updated = await database_js_1.prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...data,
                slug,
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId,
            userId,
            action: 'updated',
            entityType: 'workspace',
            entityId: workspaceId,
            metadata: { changes: data },
        });
        return updated;
    },
    // Delete workspace
    async deleteWorkspace(workspaceId, userId) {
        const workspace = await database_js_1.prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                deletedAt: null,
                ownerId: userId,
            },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found or you are not the owner');
        }
        // Soft delete
        await database_js_1.prisma.workspace.update({
            where: { id: workspaceId },
            data: { deletedAt: new Date() },
        });
    },
    // List members
    async listMembers(workspaceId) {
        const members = await database_js_1.prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        role: true,
                    },
                },
            },
            orderBy: { joinedAt: 'asc' },
        });
        return members.map((m) => ({
            id: m.id,
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            userRole: m.user.role,
            workspaceRole: m.role,
            joinedAt: m.joinedAt,
        }));
    },
    // Invite member
    async inviteMember(workspaceId, inviterId, inviterName, data) {
        const workspace = await database_js_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        // Find or check user by email
        const user = await database_js_1.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (!user) {
            // Send invite email to non-registered user
            await email_service_js_1.emailService.sendWorkspaceInviteEmail(data.email, inviterName, workspace.name, workspaceId);
            return { invited: true, registered: false };
        }
        // Check if already a member
        const existingMember = await database_js_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id,
                },
            },
        });
        if (existingMember) {
            throw new errors_js_1.ConflictError('User is already a member of this workspace');
        }
        // Add member
        await database_js_1.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId: user.id,
                role: data.role,
            },
        });
        // Send notification email
        await email_service_js_1.emailService.sendWorkspaceInviteEmail(user.email, inviterName, workspace.name, workspaceId);
        await activity_service_js_1.activityService.log({
            workspaceId,
            userId: inviterId,
            action: 'created',
            entityType: 'workspace',
            entityId: workspaceId,
            metadata: { invitedUserId: user.id, role: data.role },
        });
        return { invited: true, registered: true };
    },
    // Update member role
    async updateMemberRole(workspaceId, targetUserId, currentUserId, role) {
        const workspace = await database_js_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        // Can't change owner role
        if (workspace.ownerId === targetUserId) {
            throw new errors_js_1.ForbiddenError('Cannot change owner role');
        }
        // Can't make someone else the owner (except transferring ownership)
        if (role === 'owner') {
            throw new errors_js_1.ForbiddenError('Cannot assign owner role');
        }
        const member = await database_js_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: targetUserId,
                },
            },
        });
        if (!member) {
            throw new errors_js_1.NotFoundError('Member not found');
        }
        const updated = await database_js_1.prisma.workspaceMember.update({
            where: { id: member.id },
            data: { role },
        });
        await activity_service_js_1.activityService.log({
            workspaceId,
            userId: currentUserId,
            action: 'updated',
            entityType: 'workspace',
            entityId: workspaceId,
            metadata: { targetUserId, newRole: role },
        });
        return updated;
    },
    // Remove member
    async removeMember(workspaceId, targetUserId, currentUserId) {
        const workspace = await database_js_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        // Owner can't be removed
        if (workspace.ownerId === targetUserId) {
            throw new errors_js_1.ForbiddenError('Cannot remove workspace owner');
        }
        const member = await database_js_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: targetUserId,
                },
            },
        });
        if (!member) {
            throw new errors_js_1.NotFoundError('Member not found');
        }
        await database_js_1.prisma.workspaceMember.delete({
            where: { id: member.id },
        });
        await activity_service_js_1.activityService.log({
            workspaceId,
            userId: currentUserId,
            action: 'deleted',
            entityType: 'workspace',
            entityId: workspaceId,
            metadata: { removedUserId: targetUserId },
        });
    },
    // Leave workspace
    async leaveWorkspace(workspaceId, userId) {
        const workspace = await database_js_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new errors_js_1.NotFoundError('Workspace not found');
        }
        // Owner can't leave
        if (workspace.ownerId === userId) {
            throw new errors_js_1.ForbiddenError('Owner cannot leave workspace. Transfer ownership or delete the workspace.');
        }
        const member = await database_js_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!member) {
            throw new errors_js_1.NotFoundError('You are not a member of this workspace');
        }
        await database_js_1.prisma.workspaceMember.delete({
            where: { id: member.id },
        });
    },
};
exports.default = exports.workspaceService;
//# sourceMappingURL=workspace.service.js.map