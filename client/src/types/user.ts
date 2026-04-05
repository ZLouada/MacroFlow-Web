// User and Role types
export type UserRole =
  | 'admin'
  | 'coo'
  | 'projectManager'
  | 'teamLead'
  | 'developer'
  | 'designer'
  | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fr' | 'ar';
  notifications: NotificationPreferences;
  dashboardLayout: DashboardLayoutConfig;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  taskOverdue: boolean;
  mentions: boolean;
}

// Dashboard and Widget types
export type WidgetType =
  | 'tasksSummary'
  | 'projectProgress'
  | 'teamVelocity'
  | 'burndownChart'
  | 'upcomingDeadlines'
  | 'recentActivity'
  | 'myTasks'
  | 'teamMembers'
  | 'quickActions';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  config?: Record<string, unknown>;
}

export interface DashboardLayoutConfig {
  widgets: Widget[];
  columns: number;
}

// Role-based widget configuration
export const DEFAULT_WIDGETS_BY_ROLE: Record<UserRole, WidgetType[]> = {
  admin: [
    'tasksSummary',
    'teamVelocity',
    'projectProgress',
    'recentActivity',
    'teamMembers',
  ],
  coo: [
    'projectProgress',
    'teamVelocity',
    'burndownChart',
    'upcomingDeadlines',
    'tasksSummary',
  ],
  projectManager: [
    'projectProgress',
    'myTasks',
    'upcomingDeadlines',
    'teamMembers',
    'burndownChart',
  ],
  teamLead: [
    'myTasks',
    'teamVelocity',
    'upcomingDeadlines',
    'recentActivity',
    'quickActions',
  ],
  developer: ['myTasks', 'upcomingDeadlines', 'recentActivity', 'quickActions'],
  designer: ['myTasks', 'upcomingDeadlines', 'recentActivity', 'quickActions'],
  viewer: ['projectProgress', 'recentActivity', 'upcomingDeadlines'],
};
