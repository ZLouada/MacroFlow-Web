import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/index';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, TokenPayload, UserRole, WorkspaceRole, ProjectRole } from '../types/index';

// ===========================================
// JWT Authentication Middleware
// ===========================================

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    // Verify token
    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;

    // Verify session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user and session to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };
    req.session = session;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

// ===========================================
// Optional Authentication
// ===========================================

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;

    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId, deletedAt: null },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        };
        req.session = session;
      }
    }

    next();
  } catch {
    // Silently ignore auth errors for optional auth
    next();
  }
};

// ===========================================
// Role-Based Access Control
// ===========================================

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// ===========================================
// Workspace Access Middleware
// ===========================================

export const requireWorkspaceAccess = (...allowedRoles: WorkspaceRole[]) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const workspaceId = req.params.workspaceId || req.params.id;

      if (!workspaceId) {
        throw new ForbiddenError('Workspace ID required');
      }

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id,
          },
        },
        include: { workspace: true },
      });

      if (!member) {
        throw new ForbiddenError('Not a member of this workspace');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(member.role as WorkspaceRole)) {
        throw new ForbiddenError('Insufficient workspace permissions');
      }

      req.workspaceMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ===========================================
// Project Access Middleware
// ===========================================

export const requireProjectAccess = (...allowedRoles: ProjectRole[]) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const projectId = req.params.projectId || req.params.id;

      if (!projectId) {
        throw new ForbiddenError('Project ID required');
      }

      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.id,
          },
        },
        include: { project: true },
      });

      if (!member) {
        // Check workspace admin access
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: req.user.id },
                },
              },
            },
          },
        });

        if (!project) {
          throw new ForbiddenError('Project not found');
        }

        const workspaceMember = project.workspace.members[0];
        if (!workspaceMember || !['owner', 'admin'].includes(workspaceMember.role)) {
          throw new ForbiddenError('Not a member of this project');
        }

        // Workspace admins have full access
        req.projectMember = {
          id: 'workspace-admin',
          projectId,
          userId: req.user.id,
          role: 'manager' as ProjectRole,
          joinedAt: new Date(),
          project: project,
        };
        next();
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(member.role as ProjectRole)) {
        throw new ForbiddenError('Insufficient project permissions');
      }

      req.projectMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// ===========================================
// Email Verification Check
// ===========================================

export const requireEmailVerified = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (!req.user.emailVerified) {
    return next(new ForbiddenError('Email verification required'));
  }

  next();
};
