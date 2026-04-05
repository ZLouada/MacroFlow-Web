"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerified = exports.requireProjectAccess = exports.requireWorkspaceAccess = exports.requireRole = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const index_1 = require("../config/index");
const errors_1 = require("../utils/errors");
// ===========================================
// JWT Authentication Middleware
// ===========================================
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_1.UnauthorizedError('Invalid token format');
        }
        // Verify token
        const payload = jsonwebtoken_1.default.verify(token, index_1.config.jwt.secret);
        // Verify session exists and is valid
        const session = await database_1.prisma.session.findFirst({
            where: {
                id: payload.sessionId,
                userId: payload.userId,
                expiresAt: { gt: new Date() },
            },
        });
        if (!session) {
            throw new errors_1.UnauthorizedError('Session expired or invalid');
        }
        // Get user
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.userId, deletedAt: null },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        // Attach user and session to request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
        };
        req.session = session;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.UnauthorizedError('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errors_1.UnauthorizedError('Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
// ===========================================
// Optional Authentication
// ===========================================
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const payload = jsonwebtoken_1.default.verify(token, index_1.config.jwt.secret);
        const session = await database_1.prisma.session.findFirst({
            where: {
                id: payload.sessionId,
                userId: payload.userId,
                expiresAt: { gt: new Date() },
            },
        });
        if (session) {
            const user = await database_1.prisma.user.findUnique({
                where: { id: payload.userId, deletedAt: null },
            });
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    emailVerified: user.emailVerified,
                    twoFactorEnabled: user.twoFactorEnabled,
                };
                req.session = session;
            }
        }
        next();
    }
    catch {
        // Silently ignore auth errors for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
// ===========================================
// Role-Based Access Control
// ===========================================
const requireRole = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('Insufficient permissions'));
        }
        next();
    };
};
exports.requireRole = requireRole;
// ===========================================
// Workspace Access Middleware
// ===========================================
const requireWorkspaceAccess = (...allowedRoles) => {
    return async (req, _res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            const workspaceId = req.params.workspaceId || req.params.id;
            if (!workspaceId) {
                throw new errors_1.ForbiddenError('Workspace ID required');
            }
            const member = await database_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: req.user.id,
                    },
                },
                include: { workspace: true },
            });
            if (!member) {
                throw new errors_1.ForbiddenError('Not a member of this workspace');
            }
            if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
                throw new errors_1.ForbiddenError('Insufficient workspace permissions');
            }
            req.workspaceMember = member;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireWorkspaceAccess = requireWorkspaceAccess;
// ===========================================
// Project Access Middleware
// ===========================================
const requireProjectAccess = (...allowedRoles) => {
    return async (req, _res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.UnauthorizedError('Authentication required');
            }
            const projectId = req.params.projectId || req.params.id;
            if (!projectId) {
                throw new errors_1.ForbiddenError('Project ID required');
            }
            const member = await database_1.prisma.projectMember.findUnique({
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
                const project = await database_1.prisma.project.findUnique({
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
                    throw new errors_1.ForbiddenError('Project not found');
                }
                const workspaceMember = project.workspace.members[0];
                if (!workspaceMember || !['owner', 'admin'].includes(workspaceMember.role)) {
                    throw new errors_1.ForbiddenError('Not a member of this project');
                }
                // Workspace admins have full access
                req.projectMember = {
                    id: 'workspace-admin',
                    projectId,
                    userId: req.user.id,
                    role: 'manager',
                    joinedAt: new Date(),
                    project: project,
                };
                next();
                return;
            }
            if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
                throw new errors_1.ForbiddenError('Insufficient project permissions');
            }
            req.projectMember = member;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireProjectAccess = requireProjectAccess;
// ===========================================
// Email Verification Check
// ===========================================
const requireEmailVerified = (req, _res, next) => {
    if (!req.user) {
        return next(new errors_1.UnauthorizedError('Authentication required'));
    }
    if (!req.user.emailVerified) {
        return next(new errors_1.ForbiddenError('Email verification required'));
    }
    next();
};
exports.requireEmailVerified = requireEmailVerified;
//# sourceMappingURL=auth.middleware.js.map