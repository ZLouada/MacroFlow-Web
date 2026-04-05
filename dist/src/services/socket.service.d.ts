import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
interface ConnectedUser {
    socketId: string;
    userId: string;
    name: string;
    avatar: string | null;
    color: string;
}
export declare const initializeSocket: (httpServer: HttpServer) => Server;
declare class SocketService {
    emitToRoom(room: string, event: string, data: unknown): void;
    sendToUser(userId: string, event: string, data: unknown): void;
    emitToWorkspace(workspaceId: string, event: string, data: unknown): void;
    emitToProject(projectId: string, event: string, data: unknown): void;
    emitToTask(taskId: string, event: string, data: unknown): void;
    getUsersInRoom(room: string): Promise<ConnectedUser[]>;
    isUserOnline(userId: string): boolean;
    getOnlineUsersCount(): number;
    notifyTaskCreated(projectId: string, task: unknown): void;
    notifyTaskUpdated(projectId: string, taskId: string, changes: unknown): void;
    notifyTaskDeleted(projectId: string, taskId: string): void;
    notifyTaskMoved(projectId: string, taskId: string, fromColumnId: string, toColumnId: string, order: number): void;
    notifyCommentAdded(taskId: string, comment: unknown): void;
}
export declare const getSocketService: () => SocketService;
declare const _default: {
    initializeSocket: (httpServer: HttpServer) => Server;
    getSocketService: () => SocketService;
};
export default _default;
//# sourceMappingURL=socket.service.d.ts.map