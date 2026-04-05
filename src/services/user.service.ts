import bcrypt from 'bcryptjs';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { UserRole } from '../types/index.js';
import { uploadService } from './upload.service.js';

// ===========================================
// Types
// ===========================================

interface ListUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

interface TaskFilterOptions extends PaginationOptions {
  status?: string;
  priority?: string;
  dueDate?: string;
}

interface NotificationFilterOptions extends PaginationOptions {
  unreadOnly?: boolean;
}

// ===========================================
// User Service
// ===========================================

export const userService = {
  /**
   * List all users with pagination (admin)
   */
  async listUsers(options: ListUsersOptions) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(role && { role: role as UserRole }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: { name?: string; email?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (existingUser) {
        throw new BadRequestError('Email is already taken');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
      },
    });

    return updatedUser;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, data: Record<string, unknown>) {
    // Create a clean copy without userId to avoid duplication
    const { userId: _, ...cleanData } = data;
    
    // Handle dashboardLayout type
    if (cleanData.dashboardLayout !== undefined) {
      cleanData.dashboardLayout = cleanData.dashboardLayout as Prisma.InputJsonValue;
    }

    const createData: Prisma.UserPreferencesUncheckedCreateInput = {
      userId,
      ...cleanData,
    };

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: createData,
      update: cleanData as Prisma.UserPreferencesUncheckedUpdateInput,
    });

    return preferences;
  },

  /**
   * Upload user avatar
   */
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      await uploadService.deleteFile(user.avatar).catch(() => {
        // Ignore errors when deleting old avatar
      });
    }

    // Upload new avatar
    const result = await uploadService.uploadFile(file, 'avatars');

    // Update user with new avatar URL
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.url },
    });

    return { avatarUrl: result.url };
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.avatar) {
      await uploadService.deleteFile(user.avatar).catch(() => {
        // Ignore errors when deleting avatar
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });
  },

  /**
   * Search users (for mentions, assignments)
   */
  async searchUsers(query: string, workspaceId?: string, limit = 10) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
      ...(workspaceId && {
        workspaces: {
          some: { workspaceId },
        },
      }),
    };

    const users = await prisma.user.findMany({
      where,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return users;
  },

  /**
   * Get user's workspaces
   */
  async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  },

  /**
   * Get user's assigned tasks with pagination
   */
  async getUserTasks(userId: string, options: TaskFilterOptions) {
    const { status, priority, dueDate, cursor, limit = 20 } = options;

    const where: Prisma.TaskWhereInput = {
      assigneeId: userId,
      deletedAt: null,
      ...(status && { status: status as TaskStatus }),
      ...(priority && { priority: priority as TaskPriority }),
      ...(dueDate && {
        dueDate: {
          lte: new Date(dueDate),
        },
      }),
      ...(cursor && {
        createdAt: { lt: new Date(cursor) },
      }),
    };

    const tasks = await prisma.task.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
      },
    });

    const hasMore = tasks.length > limit;
    const data = hasMore ? tasks.slice(0, -1) : tasks;
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
   * Get user's notifications with pagination
   */
  async getUserNotifications(userId: string, options: NotificationFilterOptions) {
    const { unreadOnly, cursor, limit = 20 } = options;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly && { read: false }),
      ...(cursor && {
        createdAt: { lt: new Date(cursor) },
      }),
    };

    const notifications = await prisma.notification.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > limit;
    const data = hasMore ? notifications.slice(0, -1) : notifications;
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
   * Delete user account (soft delete)
   */
  async deleteUser(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ForbiddenError('Invalid password');
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });
  },

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, options: PaginationOptions) {
    const { cursor, limit = 20 } = options;

    const where: Prisma.ActivityWhereInput = {
      userId,
      ...(cursor && {
        createdAt: { lt: new Date(cursor) },
      }),
    };

    const activities = await prisma.activity.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
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
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },

  /**
   * Suspend user (admin only)
   */
  async suspendUser(userId: string, _reason?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Soft delete the user to suspend them
    const suspendedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    return suspendedUser;
  },

  /**
   * Activate user (admin only)
   */
  async activateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const activatedUser = await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        emailVerified: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return activatedUser;
  },

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new ForbiddenError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all other sessions
    await prisma.session.deleteMany({
      where: { userId },
    });
  },
};

export default userService;
