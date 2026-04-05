"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketService = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const database_js_1 = require("../config/database.js");
const logger_js_1 = require("../utils/logger.js");
const PRESENCE_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];
let io = null;
const connectedUsers = new Map();
const userSockets = new Map();
const getRandomColor = () => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: index_js_1.config.cors.origin,
            credentials: index_js_1.config.cors.credentials,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const payload = jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.secret);
            const user = await database_js_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, name: true, avatar: true },
            });
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.userId = user.id;
            socket.userName = user.name;
            socket.userAvatar = user.avatar;
            next();
        }
        catch (error) {
            logger_js_1.logger.error('Socket authentication error:', error);
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const userName = socket.userName;
        const userAvatar = socket.userAvatar ?? null;
        logger_js_1.logger.info(`User connected: ${userName} (${socket.id})`);
        // Track connected user
        const color = getRandomColor();
        connectedUsers.set(socket.id, {
            socketId: socket.id,
            userId,
            name: userName,
            avatar: userAvatar,
            color,
        });
        // Track user's sockets
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        // Update presence in database
        await database_js_1.prisma.userPresence.upsert({
            where: { userId },
            create: {
                visitorId: socket.id,
                userId,
                status: 'online',
                color,
                lastSeen: new Date(),
            },
            update: {
                status: 'online',
                lastSeen: new Date(),
            },
        });
        // Join personal room
        socket.join(`user:${userId}`);
        // ===========================================
        // Room Management
        // ===========================================
        socket.on('join:workspace', (workspaceId) => {
            socket.join(`workspace:${workspaceId}`);
            logger_js_1.logger.debug(`${userName} joined workspace:${workspaceId}`);
        });
        socket.on('leave:workspace', (workspaceId) => {
            socket.leave(`workspace:${workspaceId}`);
        });
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
            logger_js_1.logger.debug(`${userName} joined project:${projectId}`);
            // Broadcast presence to project members
            const presence = connectedUsers.get(socket.id);
            socket.to(`project:${projectId}`).emit('presence:joined', presence);
        });
        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
            socket.to(`project:${projectId}`).emit('presence:left', { userId });
        });
        socket.on('join:task', (taskId) => {
            socket.join(`task:${taskId}`);
        });
        socket.on('leave:task', (taskId) => {
            socket.leave(`task:${taskId}`);
        });
        // ===========================================
        // Presence Updates
        // ===========================================
        socket.on('presence:update', async (data) => {
            await database_js_1.prisma.userPresence.upsert({
                where: { userId },
                create: {
                    visitorId: socket.id,
                    userId,
                    status: data.status || 'online',
                    currentView: data.currentView,
                    currentTaskId: data.currentTaskId,
                    cursorPosition: data.cursorPosition,
                    color,
                    lastSeen: new Date(),
                },
                update: {
                    status: data.status,
                    currentView: data.currentView,
                    currentTaskId: data.currentTaskId,
                    cursorPosition: data.cursorPosition,
                    lastSeen: new Date(),
                },
            });
            // Broadcast to all rooms the user is in
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    socket.to(room).emit('presence:update', {
                        userId,
                        name: userName,
                        avatar: userAvatar,
                        color,
                        ...data,
                    });
                }
            });
        });
        // ===========================================
        // Collaboration Features
        // ===========================================
        socket.on('typing:start', (taskId) => {
            socket.to(`task:${taskId}`).emit('user:typing', {
                userId,
                name: userName,
                taskId,
            });
        });
        socket.on('typing:stop', (taskId) => {
            socket.to(`task:${taskId}`).emit('user:stopped-typing', {
                userId,
                taskId,
            });
        });
        socket.on('cursor:move', (data) => {
            socket.to(`project:${data.projectId}`).emit('cursor:move', {
                userId,
                name: userName,
                color,
                position: data.position,
            });
        });
        // ===========================================
        // Disconnect
        // ===========================================
        socket.on('disconnect', async () => {
            logger_js_1.logger.info(`User disconnected: ${userName} (${socket.id})`);
            connectedUsers.delete(socket.id);
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                    // Update presence to offline
                    await database_js_1.prisma.userPresence.update({
                        where: { userId },
                        data: {
                            status: 'offline',
                            lastSeen: new Date(),
                        },
                    }).catch(() => { });
                }
            }
            // Notify rooms
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    socket.to(room).emit('presence:left', { userId });
                }
            });
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
// ===========================================
// Socket Service API
// ===========================================
class SocketService {
    // Emit to specific room
    emitToRoom(room, event, data) {
        if (io) {
            io.to(room).emit(event, data);
        }
    }
    // Emit to user
    sendToUser(userId, event, data) {
        if (io) {
            io.to(`user:${userId}`).emit(event, data);
        }
    }
    // Emit to workspace
    emitToWorkspace(workspaceId, event, data) {
        this.emitToRoom(`workspace:${workspaceId}`, event, data);
    }
    // Emit to project
    emitToProject(projectId, event, data) {
        this.emitToRoom(`project:${projectId}`, event, data);
    }
    // Emit to task viewers
    emitToTask(taskId, event, data) {
        this.emitToRoom(`task:${taskId}`, event, data);
    }
    // Get users in room
    async getUsersInRoom(room) {
        if (!io)
            return [];
        const sockets = await io.in(room).fetchSockets();
        return sockets
            .map((s) => connectedUsers.get(s.id))
            .filter((u) => u !== undefined);
    }
    // Check if user is online
    isUserOnline(userId) {
        return userSockets.has(userId);
    }
    // Get online users count
    getOnlineUsersCount() {
        return userSockets.size;
    }
    // Task events
    notifyTaskCreated(projectId, task) {
        this.emitToProject(projectId, 'task:created', task);
    }
    notifyTaskUpdated(projectId, taskId, changes) {
        this.emitToProject(projectId, 'task:updated', { taskId, changes });
    }
    notifyTaskDeleted(projectId, taskId) {
        this.emitToProject(projectId, 'task:deleted', { taskId });
    }
    notifyTaskMoved(projectId, taskId, fromColumnId, toColumnId, order) {
        this.emitToProject(projectId, 'task:moved', {
            taskId,
            fromColumnId,
            toColumnId,
            order,
        });
    }
    // Comment events
    notifyCommentAdded(taskId, comment) {
        this.emitToTask(taskId, 'comment:added', comment);
    }
}
let socketServiceInstance = null;
const getSocketService = () => {
    if (!socketServiceInstance) {
        socketServiceInstance = new SocketService();
    }
    return socketServiceInstance;
};
exports.getSocketService = getSocketService;
exports.default = { initializeSocket: exports.initializeSocket, getSocketService: exports.getSocketService };
//# sourceMappingURL=socket.service.js.map