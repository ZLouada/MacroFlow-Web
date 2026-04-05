import { v4 as uuidv4 } from 'uuid';
import { Prisma, ProjectStatus, WorkspaceRole as PrismaWorkspaceRole, ActivityAction } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../utils/errors';
import { uploadService } from './upload.service';

// ===========================================
// Types
// ===========================================

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

interface MemberFilterOptions extends PaginationOptions {
  role?: string;
}

interface ProjectFilterOptions extends PaginationOptions {
  status?: string;
}

interface ActivityFilterOptions extends PaginationOptions {
  type?: string;
}

// ===========================================
// Helper: Generate slug
// ===========================================

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

const ensureUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// ===========================================
// Workspace Service
// ===========================================

export const workspaceService = {
  /**
   * Create a new workspace
   */
  async createWorkspace(userId: string, data: { name: string; icon?: string; color?: string; isPrivate?: boolean }) {
    const slug = await ensureUniqueSlug(generateSlug(data.name));

    const workspace = await prisma.workspace.create({
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
  async getUserWorkspaces(userId: string, options: PaginationOptions) {
    const { cursor, limit = 20 } = options;

    const memberships = await prisma.workspaceMember.findMany({
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
  async getWorkspaceById(workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
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
      throw new NotFoundError('Workspace not found');
    }

    return workspace;
  },

  /**
   * Update workspace
   */
  async updateWorkspace(workspaceId: string, data: { name?: string; icon?: string; color?: string; isPrivate?: boolean }) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    let slug = workspace.slug;
    if (data.name && data.name !== workspace.name) {
      slug = await ensureUniqueSlug(generateSlug(data.name), workspaceId);
    }

    const updated = await prisma.workspace.update({
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
  async deleteWorkspace(workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { deletedAt: new Date() },
    });
  },

  /**
   * Get workspace members with pagination
   */
  async getWorkspaceMembers(workspaceId: string, options: MemberFilterOptions) {
    const { cursor, limit = 20, role } = options;

    const where: Prisma.WorkspaceMemberWhereInput = {
      workspaceId,
      ...(role && { role: role as PrismaWorkspaceRole }),
      ...(cursor && {
        joinedAt: { lt: new Date(cursor) },
      }),
    };

    const members = await prisma.workspaceMember.findMany({
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
  async addMember(workspaceId: string, data: { userId?: string; email?: string; role?: string }) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    let userId = data.userId;

    // If email provided, find user
    if (!userId && data.email) {
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (!user) {
        throw new NotFoundError('User with this email not found');
      }
      userId = user.id;
    }

    if (!userId) {
      throw new BadRequestError('Either userId or email is required');
    }

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role: (data.role as PrismaWorkspaceRole) || 'member',
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
  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    // Can't change owner role
    if (workspace.ownerId === userId) {
      throw new ForbiddenError('Cannot change owner role');
    }

    // Can't make someone else the owner
    if (role === 'owner') {
      throw new ForbiddenError('Cannot assign owner role directly. Use transfer ownership.');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: member.id },
      data: { role: role as PrismaWorkspaceRole },
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
  async removeMember(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    // Owner can't be removed
    if (workspace.ownerId === userId) {
      throw new ForbiddenError('Cannot remove workspace owner');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    await prisma.workspaceMember.delete({
      where: { id: member.id },
    });
  },

  /**
   * Leave workspace
   */
  async leaveWorkspace(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    // Owner can't leave
    if (workspace.ownerId === userId) {
      throw new ForbiddenError('Owner cannot leave workspace. Transfer ownership or delete the workspace.');
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member) {
      throw new NotFoundError('You are not a member of this workspace');
    }

    await prisma.workspaceMember.delete({
      where: { id: member.id },
    });
  },

  /**
   * Transfer workspace ownership
   */
  async transferOwnership(workspaceId: string, currentOwnerId: string, newOwnerId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: currentOwnerId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found or you are not the owner');
    }

    // Check if new owner is a member
    const newOwnerMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: newOwnerId,
        },
      },
    });

    if (!newOwnerMember) {
      throw new BadRequestError('New owner must be a member of the workspace');
    }

    // Update workspace owner and member roles
    await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerId },
      }),
      prisma.workspaceMember.update({
        where: { id: newOwnerMember.id },
        data: { role: 'owner' },
      }),
      prisma.workspaceMember.updateMany({
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
  async createInviteLink(workspaceId: string, options: { role?: string; expiresIn?: number }) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const inviteCode = uuidv4();
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
  async joinViaInvite(inviteCode: string, userId: string) {
    // In a real implementation, you'd look up the invite code in a database table
    // For now, we'll assume invite codes are valid and decode the workspace ID from them
    // This is a simplified implementation
    
    throw new BadRequestError('Invite system requires additional setup. Please have an admin add you directly.');
  },

  /**
   * Get workspace projects
   */
  async getWorkspaceProjects(workspaceId: string, options: ProjectFilterOptions) {
    const { cursor, limit = 20, status } = options;

    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(status && { status: status as ProjectStatus }),
      ...(cursor && {
        createdAt: { lt: new Date(cursor) },
      }),
    };

    const projects = await prisma.project.findMany({
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
  async getWorkspaceActivity(workspaceId: string, options: ActivityFilterOptions) {
    const { cursor, limit = 20, type } = options;

    const where: Prisma.ActivityWhereInput = {
      workspaceId,
      ...(type && { action: type as ActivityAction }),
      ...(cursor && {
        createdAt: { lt: new Date(cursor) },
      }),
    };

    const activities = await prisma.activity.findMany({
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
  async getWorkspaceSettings(workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
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
      throw new NotFoundError('Workspace not found');
    }

    return workspace;
  },

  /**
   * Update workspace settings
   */
  async updateWorkspaceSettings(workspaceId: string, data: { isPrivate?: boolean; isPremium?: boolean }) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const updated = await prisma.workspace.update({
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
  async updateWorkspaceLogo(workspaceId: string, file: Express.Multer.File) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    // Delete old icon if exists
    if (workspace.icon) {
      await uploadService.deleteFile(workspace.icon).catch(() => {});
    }

    // Upload new logo
    const result = await uploadService.uploadFile(file, 'workspace-logos');

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { icon: result.url },
    });

    return { logoUrl: result.url };
  },

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats(workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const [memberCount, projectCount, taskStats, recentActivity] = await Promise.all([
      prisma.workspaceMember.count({ where: { workspaceId } }),
      prisma.project.count({ where: { workspaceId, deletedAt: null } }),
      prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { workspaceId },
          deletedAt: null,
        },
        _count: true,
      }),
      prisma.activity.count({
        where: {
          workspaceId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const tasksByStatus = taskStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);

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

export default workspaceService;
