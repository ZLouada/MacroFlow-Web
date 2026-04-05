export * from './user';
export * from './task';

// WebSocket event types
export interface WebSocketEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface TaskMovedEvent {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
  userId: string;
}

export interface TaskUpdatedEvent {
  taskId: string;
  changes: Partial<import('./task').Task>;
  userId: string;
}

export interface TaskCreatedEvent {
  task: import('./task').Task;
  userId: string;
}

export interface TaskDeletedEvent {
  taskId: string;
  userId: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}
