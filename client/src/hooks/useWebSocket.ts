import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { WebSocketEvent, TaskMovedEvent, TaskUpdatedEvent } from '@/types';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}

type EventHandler<T = unknown> = (event: WebSocketEvent<T>) => void;

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    // In production, use VITE_API_URL (same server handles WebSocket)
    // In development, fall back to localhost
    url = import.meta.env.VITE_API_URL || 'http://localhost:3000',
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    socketRef.current = io(url, {
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setState({ isConnected: true, isConnecting: false, error: null });
    });

    socketRef.current.on('disconnect', () => {
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socketRef.current.on('connect_error', (error) => {
      setState({ isConnected: false, isConnecting: false, error });
    });

    // Handle incoming events
    socketRef.current.onAny((eventType: string, data: unknown) => {
      const event: WebSocketEvent = {
        type: eventType,
        payload: data,
        timestamp: Date.now(),
      };

      const handlers = handlersRef.current.get(eventType);
      handlers?.forEach((handler) => handler(event));

      // Also notify 'all' handlers
      const allHandlers = handlersRef.current.get('*');
      allHandlers?.forEach((handler) => handler(event));
    });
  }, [url, reconnectionAttempts, reconnectionDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setState({ isConnected: false, isConnecting: false, error: null });
  }, []);

  // Subscribe to events
  const subscribe = useCallback(
    <T = unknown>(eventType: string, handler: EventHandler<T>) => {
      if (!handlersRef.current.has(eventType)) {
        handlersRef.current.set(eventType, new Set());
      }
      handlersRef.current.get(eventType)!.add(handler as EventHandler);

      // Return unsubscribe function
      return () => {
        handlersRef.current.get(eventType)?.delete(handler as EventHandler);
      };
    },
    []
  );

  // Emit events
  const emit = useCallback(
    <T = unknown>(eventType: string, data: T) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(eventType, data);
      }
    },
    []
  );

  // Specialized event emitters for common operations
  const emitTaskMoved = useCallback(
    (data: Omit<TaskMovedEvent, 'userId'>) => {
      emit('task:moved', data);
    },
    [emit]
  );

  const emitTaskUpdated = useCallback(
    (data: Omit<TaskUpdatedEvent, 'userId'>) => {
      emit('task:updated', data);
    },
    [emit]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    subscribe,
    emit,
    emitTaskMoved,
    emitTaskUpdated,
  };
}
