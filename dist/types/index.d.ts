import { Request } from 'express';
import { User, Session, Workspace, Project, Task, WorkspaceMember, ProjectMember } from '@prisma/client';
export declare enum UserRole {
    ADMIN = "admin",
    COO = "coo",
    PROJECT_MANAGER = "projectManager",
    TEAM_LEAD = "teamLead",
    DEVELOPER = "developer",
    DESIGNER = "designer",
    VIEWER = "viewer"
}
export declare enum WorkspaceRole {
    OWNER = "owner",
    ADMIN = "admin",
    MEMBER = "member",
    GUEST = "guest"
}
export declare enum ProjectRole {
    MANAGER = "manager",
    MEMBER = "member",
    VIEWER = "viewer"
}
export declare enum TaskStatus {
    TODO = "todo",
    IN_PROGRESS = "inProgress",
    REVIEW = "review",
    DONE = "done",
    BLOCKED = "blocked"
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum ProjectStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    COMPLETED = "completed"
}
export declare enum PresenceStatus {
    ONLINE = "online",
    IDLE = "idle",
    AWAY = "away",
    DND = "dnd",
    OFFLINE = "offline"
}
export declare enum DependencyType {
    FINISH_TO_START = "finishToStart",
    START_TO_START = "startToStart",
    FINISH_TO_FINISH = "finishToFinish",
    START_TO_FINISH = "startToFinish"
}
export declare enum ActivityAction {
    CREATED = "created",
    UPDATED = "updated",
    DELETED = "deleted",
    MOVED = "moved",
    ASSIGNED = "assigned",
    COMMENTED = "commented"
}
export declare enum EntityType {
    TASK = "task",
    PROJECT = "project",
    COMMENT = "comment",
    WORKSPACE = "workspace"
}
export declare enum NotificationType {
    TASK_ASSIGNED = "taskAssigned",
    TASK_COMPLETED = "taskCompleted",
    TASK_OVERDUE = "taskOverdue",
    MENTION = "mention",
    COMMENT_ADDED = "commentAdded",
    PROJECT_INVITED = "projectInvited",
    WORKSPACE_INVITED = "workspaceInvited",
    SYSTEM = "system"
}
export declare enum Theme {
    LIGHT = "light",
    DARK = "dark",
    SYSTEM = "system"
}
export declare enum Language {
    EN = "en",
    FR = "fr",
    AR = "ar"
}
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar: string | null;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
    session?: Session;
    workspaceMember?: WorkspaceMember & {
        workspace: Workspace;
    };
    projectMember?: ProjectMember & {
        project: Project;
    };
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        cursor: string | null;
        hasMore: boolean;
        limit: number;
    };
}
export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    sessionId: string;
}
export interface RefreshTokenPayload {
    userId: string;
    sessionId: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface SocketUser {
    userId: string;
    socketId: string;
    name: string;
    avatar: string | null;
    status: PresenceStatus;
    currentView?: string;
    currentTaskId?: string;
    cursorPosition?: {
        x: number;
        y: number;
    };
    color: string;
}
export interface PresenceUpdate {
    status?: PresenceStatus;
    currentView?: string;
    currentTaskId?: string;
    cursorPosition?: {
        x: number;
        y: number;
    };
}
export interface FiscalPolicy {
    governmentSpending: number;
    taxRate: number;
    transferPayments: number;
}
export interface MonetaryPolicy {
    interestRate: number;
    moneySupply: number;
    reserveRequirement: number;
}
export interface ExternalSector {
    exchangeRate: number;
    capitalMobility: 'none' | 'low' | 'high' | 'perfect';
    exchangeRegime: 'fixed' | 'floating';
    tradeOpenness: number;
}
export interface EconomicIndicators {
    gdp: number;
    inflation: number;
    unemployment: number;
    interestRate: number;
    exchangeRate: number;
    tradeBalance: number;
}
export interface SimulationResult {
    equilibrium: {
        income: number;
        interestRate: number;
        exchangeRate: number;
    };
    curves: {
        is: {
            x: number;
            y: number;
        }[];
        lm: {
            x: number;
            y: number;
        }[];
        bp: {
            x: number;
            y: number;
        }[];
    };
    indicators: EconomicIndicators;
    analysis: string[];
}
export interface TaskSummary {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    overdue: number;
    completed: number;
}
export interface TeamVelocity {
    period: string;
    completed: number;
    points: number;
}
export interface BurndownData {
    date: string;
    planned: number;
    actual: number;
}
export interface WorkloadData {
    userId: string;
    name: string;
    avatar: string | null;
    tasksCount: number;
    estimatedHours: number;
    actualHours: number;
}
export interface TaskFilters {
    status?: TaskStatus | TaskStatus[];
    priority?: TaskPriority | TaskPriority[];
    assigneeId?: string;
    labelIds?: string[];
    search?: string;
    dueBefore?: Date;
    dueAfter?: Date;
    isMilestone?: boolean;
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    cursor?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export type { User, Session, Workspace, Project, Task, WorkspaceMember, ProjectMember };
//# sourceMappingURL=index.d.ts.map