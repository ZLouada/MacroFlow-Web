import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { TokenPayload, PresenceUpdate, PresenceStatus } from '../types/index.js';

// ===========================================
// Socket Service
// ===========================================

interface ConnectedUser {
  socketId: string;
  userId: string;
  name: string;
  avatar: string | null;
  color: string;
}

const PRESENCE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];

let io: Server | null = null;
const connectedUsers = new Map<string, ConnectedUser>();
const userSockets = new Map<string, Set<string>>();

const getRandomColor = () => PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: config.cors.credentials,
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

      const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, avatar: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as Socket & { userId: string; userName: string; userAvatar: string | null }).userId = user.id;
      (socket as Socket & { userId: string; userName: string; userAvatar: string | null }).userName = user.name;
      (socket as Socket & { userId: string; userName: string; userAvatar: string | null }).userAvatar = user.avatar;

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket & { userId?: string; userName?: string; userAvatar?: string | null }) => {
    const userId = socket.userId!;
    const userName = socket.userName!;
    const userAvatar = socket.userAvatar ?? null;

    logger.info(`User connected: ${userName} (${socket.id})`);

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
    userSockets.get(userId)!.add(socket.id);

    // Update presence in database
    await prisma.userPresence.upsert({
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

    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      logger.debug(`${userName} joined workspace:${workspaceId}`);
    });

    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.debug(`${userName} joined project:${projectId}`);

      // Broadcast presence to project members
      const presence = connectedUsers.get(socket.id);
      socket.to(`project:${projectId}`).emit('presence:joined', presence);
    });

    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('presence:left', { userId });
    });

    socket.on('join:task', (taskId: string) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('leave:task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
    });

    // ===========================================
    // Presence Updates
    // ===========================================

    socket.on('presence:update', async (data: PresenceUpdate) => {
      await prisma.userPresence.upsert({
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

    socket.on('typing:start', (taskId: string) => {
      socket.to(`task:${taskId}`).emit('user:typing', {
        userId,
        name: userName,
        taskId,
      });
    });

    socket.on('typing:stop', (taskId: string) => {
      socket.to(`task:${taskId}`).emit('user:stopped-typing', {
        userId,
        taskId,
      });
    });

    socket.on('cursor:move', (data: { projectId: string; position: { x: number; y: number } }) => {
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
      logger.info(`User disconnected: ${userName} (${socket.id})`);

      connectedUsers.delete(socket.id);
      
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);

          // Update presence to offline
          await prisma.userPresence.update({
            where: { userId },
            data: {
              status: 'offline',
              lastSeen: new Date(),
            },
          }).catch(() => {});
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

// ===========================================
// Socket Service API
// ===========================================

class SocketService {
  // Emit to specific room
  emitToRoom(room: string, event: string, data: unknown) {
    if (io) {
      io.to(room).emit(event, data);
    }
  }

  // Emit to user
  sendToUser(userId: string, event: string, data: unknown) {
    if (io) {
      io.to(`user:${userId}`).emit(event, data);
    }
  }

  // Emit to workspace
  emitToWorkspace(workspaceId: string, event: string, data: unknown) {
    this.emitToRoom(`workspace:${workspaceId}`, event, data);
  }

  // Emit to project
  emitToProject(projectId: string, event: string, data: unknown) {
    this.emitToRoom(`project:${projectId}`, event, data);
  }

  // Emit to task viewers
  emitToTask(taskId: string, event: string, data: unknown) {
    this.emitToRoom(`task:${taskId}`, event, data);
  }

  // Get users in room
  async getUsersInRoom(room: string): Promise<ConnectedUser[]> {
    if (!io) return [];

    const sockets = await io.in(room).fetchSockets();
    return sockets
      .map((s) => connectedUsers.get(s.id))
      .filter((u): u is ConnectedUser => u !== undefined);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return userSockets.has(userId);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return userSockets.size;
  }

  // Task events
  notifyTaskCreated(projectId: string, task: unknown) {
    this.emitToProject(projectId, 'task:created', task);
  }

  notifyTaskUpdated(projectId: string, taskId: string, changes: unknown) {
    this.emitToProject(projectId, 'task:updated', { taskId, changes });
  }

  notifyTaskDeleted(projectId: string, taskId: string) {
    this.emitToProject(projectId, 'task:deleted', { taskId });
  }

  notifyTaskMoved(
    projectId: string,
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    order: number
  ) {
    this.emitToProject(projectId, 'task:moved', {
      taskId,
      fromColumnId,
      toColumnId,
      order,
    });
  }

  // Comment events
  notifyCommentAdded(taskId: string, comment: unknown) {
    this.emitToTask(taskId, 'comment:added', comment);
  }
}

let socketServiceInstance: SocketService | null = null;

export const getSocketService = (): SocketService => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService();
  }
  return socketServiceInstance;
};

export default { initializeSocket, getSocketService };
