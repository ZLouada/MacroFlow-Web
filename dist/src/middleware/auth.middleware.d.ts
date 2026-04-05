import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole, WorkspaceRole, ProjectRole } from '../types/index';
export declare const authenticate: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (...roles: UserRole[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const requireWorkspaceAccess: (...allowedRoles: WorkspaceRole[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireProjectAccess: (...allowedRoles: ProjectRole[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const requireEmailVerified: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map