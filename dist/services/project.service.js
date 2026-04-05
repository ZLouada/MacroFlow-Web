"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const activity_service_js_1 = require("./activity.service.js");
// ===========================================
// Project Service
// ===========================================
exports.projectService = {
    // List projects in workspace
    async listProjects(workspaceId, userId) {
        // Get workspace member to check access
        const workspaceMember = await database_js_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        if (!workspaceMember) {
            throw new errors_js_1.ForbiddenError('Not a member of this workspace');
        }
        // Admins and owners see all projects
        const isAdmin = ['owner', 'admin'].includes(workspaceMember.role);
        const projects = await database_js_1.prisma.project.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                ...(isAdmin ? {} : {
                    OR: [
                        { members: { some: { userId } } },
                        { createdBy: userId },
                    ],
                }),
            },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        return projects.map((p) => ({
            ...p,
            tasksCount: p._count.tasks,
            membersCount: p._count.members,
        }));
    },
    // Create project
    async createProject(workspaceId, userId, data) {
        const project = await database_js_1.prisma.project.create({
            data: {
                workspaceId,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                createdBy: userId,
                members: {
                    create: {
                        userId,
                        role: 'manager',
                    },
                },
                // Create default columns
                columns: {
                    create: [
                        { title: 'To Do', status: 'todo', order: 0, color: '#6B7280' },
                        { title: 'In Progress', status: 'inProgress', order: 1, color: '#3B82F6' },
                        { title: 'Review', status: 'review', order: 2, color: '#F59E0B' },
                        { title: 'Done', status: 'done', order: 3, color: '#10B981' },
                    ],
                },
            },
            include: {
                columns: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId,
            projectId: project.id,
            userId,
            action: 'created',
            entityType: 'project',
            entityId: project.id,
        });
        return project;
    },
    // Get project by ID
    async getProject(projectId, userId) {
        const project = await database_js_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                },
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
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        // Check access
        const isProjectMember = project.members.some((m) => m.userId === userId);
        const isWorkspaceAdmin = project.workspace.members.some((m) => ['owner', 'admin'].includes(m.role));
        if (!isProjectMember && !isWorkspaceAdmin) {
            throw new errors_js_1.ForbiddenError('Not a member of this project');
        }
        return {
            ...project,
            tasksCount: project._count.tasks,
        };
    },
    // Update project
    async updateProject(projectId, userId, data) {
        const project = await database_js_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                members: {
                    where: { userId },
                },
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        // Check permissions
        const projectMember = project.members[0];
        const workspaceMember = project.workspace.members[0];
        const canEdit = (projectMember && projectMember.role === 'manager') ||
            (workspaceMember && ['owner', 'admin'].includes(workspaceMember.role));
        if (!canEdit) {
            throw new errors_js_1.ForbiddenError('Only project managers can update project settings');
        }
        const updated = await database_js_1.prisma.project.update({
            where: { id: projectId },
            data: {
                ...data,
                startDate: data.startDate !== undefined
                    ? (data.startDate ? new Date(data.startDate) : null)
                    : undefined,
                endDate: data.endDate !== undefined
                    ? (data.endDate ? new Date(data.endDate) : null)
                    : undefined,
            },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: project.workspaceId,
            projectId,
            userId,
            action: 'updated',
            entityType: 'project',
            entityId: projectId,
            metadata: { changes: data },
        });
        return updated;
    },
    // Delete project (soft delete)
    async deleteProject(projectId, userId) {
        const project = await database_js_1.prisma.project.findFirst({
            where: {
                id: projectId,
                deletedAt: null,
            },
            include: {
                members: {
                    where: { userId },
                },
                workspace: {
                    include: {
                        members: {
                            where: { userId },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        // Check permissions
        const projectMember = project.members[0];
        const workspaceMember = project.workspace.members[0];
        const canDelete = (projectMember && projectMember.role === 'manager') ||
            (workspaceMember && ['owner', 'admin'].includes(workspaceMember.role));
        if (!canDelete) {
            throw new errors_js_1.ForbiddenError('Only project managers can delete projects');
        }
        await database_js_1.prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: project.workspaceId,
            projectId,
            userId,
            action: 'deleted',
            entityType: 'project',
            entityId: projectId,
        });
    },
    // List project members
    async listMembers(projectId) {
        const members = await database_js_1.prisma.projectMember.findMany({
            where: { projectId },
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
            orderBy: { joinedAt: 'asc' },
        });
        return members.map((m) => ({
            id: m.id,
            userId: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
            joinedAt: m.joinedAt,
        }));
    },
    // Add project member
    async addMember(projectId, addedBy, data) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId: data.userId },
                        },
                    },
                },
            },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        // Check if user is a workspace member
        if (project.workspace.members.length === 0) {
            throw new errors_js_1.ForbiddenError('User must be a workspace member first');
        }
        // Check if already a project member
        const existingMember = await database_js_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: data.userId,
                },
            },
        });
        if (existingMember) {
            throw new errors_js_1.ConflictError('User is already a member of this project');
        }
        const member = await database_js_1.prisma.projectMember.create({
            data: {
                projectId,
                userId: data.userId,
                role: data.role,
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
        await activity_service_js_1.activityService.log({
            workspaceId: project.workspaceId,
            projectId,
            userId: addedBy,
            action: 'created',
            entityType: 'project',
            entityId: projectId,
            metadata: { addedUserId: data.userId, role: data.role },
        });
        return member;
    },
    // Remove project member
    async removeMember(projectId, targetUserId, removedBy) {
        const project = await database_js_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new errors_js_1.NotFoundError('Project not found');
        }
        const member = await database_js_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: targetUserId,
                },
            },
        });
        if (!member) {
            throw new errors_js_1.NotFoundError('Member not found');
        }
        await database_js_1.prisma.projectMember.delete({
            where: { id: member.id },
        });
        await activity_service_js_1.activityService.log({
            workspaceId: project.workspaceId,
            projectId,
            userId: removedBy,
            action: 'deleted',
            entityType: 'project',
            entityId: projectId,
            metadata: { removedUserId: targetUserId },
        });
    },
};
exports.default = exports.projectService;
//# sourceMappingURL=project.service.js.map