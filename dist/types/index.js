"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Language = exports.Theme = exports.NotificationType = exports.EntityType = exports.ActivityAction = exports.DependencyType = exports.PresenceStatus = exports.ProjectStatus = exports.TaskPriority = exports.TaskStatus = exports.ProjectRole = exports.WorkspaceRole = exports.UserRole = void 0;
// ===========================================
// Enums
// ===========================================
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["COO"] = "coo";
    UserRole["PROJECT_MANAGER"] = "projectManager";
    UserRole["TEAM_LEAD"] = "teamLead";
    UserRole["DEVELOPER"] = "developer";
    UserRole["DESIGNER"] = "designer";
    UserRole["VIEWER"] = "viewer";
})(UserRole || (exports.UserRole = UserRole = {}));
var WorkspaceRole;
(function (WorkspaceRole) {
    WorkspaceRole["OWNER"] = "owner";
    WorkspaceRole["ADMIN"] = "admin";
    WorkspaceRole["MEMBER"] = "member";
    WorkspaceRole["GUEST"] = "guest";
})(WorkspaceRole || (exports.WorkspaceRole = WorkspaceRole = {}));
var ProjectRole;
(function (ProjectRole) {
    ProjectRole["MANAGER"] = "manager";
    ProjectRole["MEMBER"] = "member";
    ProjectRole["VIEWER"] = "viewer";
})(ProjectRole || (exports.ProjectRole = ProjectRole = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "inProgress";
    TaskStatus["REVIEW"] = "review";
    TaskStatus["DONE"] = "done";
    TaskStatus["BLOCKED"] = "blocked";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["ARCHIVED"] = "archived";
    ProjectStatus["COMPLETED"] = "completed";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var PresenceStatus;
(function (PresenceStatus) {
    PresenceStatus["ONLINE"] = "online";
    PresenceStatus["IDLE"] = "idle";
    PresenceStatus["AWAY"] = "away";
    PresenceStatus["DND"] = "dnd";
    PresenceStatus["OFFLINE"] = "offline";
})(PresenceStatus || (exports.PresenceStatus = PresenceStatus = {}));
var DependencyType;
(function (DependencyType) {
    DependencyType["FINISH_TO_START"] = "finishToStart";
    DependencyType["START_TO_START"] = "startToStart";
    DependencyType["FINISH_TO_FINISH"] = "finishToFinish";
    DependencyType["START_TO_FINISH"] = "startToFinish";
})(DependencyType || (exports.DependencyType = DependencyType = {}));
var ActivityAction;
(function (ActivityAction) {
    ActivityAction["CREATED"] = "created";
    ActivityAction["UPDATED"] = "updated";
    ActivityAction["DELETED"] = "deleted";
    ActivityAction["MOVED"] = "moved";
    ActivityAction["ASSIGNED"] = "assigned";
    ActivityAction["COMMENTED"] = "commented";
})(ActivityAction || (exports.ActivityAction = ActivityAction = {}));
var EntityType;
(function (EntityType) {
    EntityType["TASK"] = "task";
    EntityType["PROJECT"] = "project";
    EntityType["COMMENT"] = "comment";
    EntityType["WORKSPACE"] = "workspace";
})(EntityType || (exports.EntityType = EntityType = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_ASSIGNED"] = "taskAssigned";
    NotificationType["TASK_COMPLETED"] = "taskCompleted";
    NotificationType["TASK_OVERDUE"] = "taskOverdue";
    NotificationType["MENTION"] = "mention";
    NotificationType["COMMENT_ADDED"] = "commentAdded";
    NotificationType["PROJECT_INVITED"] = "projectInvited";
    NotificationType["WORKSPACE_INVITED"] = "workspaceInvited";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var Theme;
(function (Theme) {
    Theme["LIGHT"] = "light";
    Theme["DARK"] = "dark";
    Theme["SYSTEM"] = "system";
})(Theme || (exports.Theme = Theme = {}));
var Language;
(function (Language) {
    Language["EN"] = "en";
    Language["FR"] = "fr";
    Language["AR"] = "ar";
})(Language || (exports.Language = Language = {}));
//# sourceMappingURL=index.js.map