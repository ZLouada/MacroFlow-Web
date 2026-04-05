// Task types
export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assignee?: TaskAssignee;
  projectId: string;
  columnId: string;
  order: number;
  labels: Label[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: TaskAssignee;
  createdAt: Date;
  updatedAt: Date;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

// Kanban types
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
  order: number;
  taskLimit?: number;
  tasks: Task[];
}

export interface KanbanBoard {
  id: string;
  projectId: string;
  columns: KanbanColumn[];
}

// Gantt types
export interface GanttTask extends Omit<Task, 'dependencies'> {
  startDate: Date;
  endDate: Date;
  progress: number;
  isMilestone: boolean;
  ganttDependencies: GanttDependency[];
}

export interface GanttDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  labels?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  search?: string;
}

export interface TaskSortOptions {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}
