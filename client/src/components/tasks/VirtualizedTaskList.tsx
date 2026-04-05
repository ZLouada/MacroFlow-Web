/**
 * Virtualized Task List with React Query Integration
 * 
 * This component demonstrates how to build a high-performance task list
 * that can handle 1000+ items while maintaining 60 FPS.
 * 
 * Key features:
 * - TanStack Virtual for windowed rendering
 * - TanStack Query for data fetching with caching
 * - Optimistic updates for instant UI feedback
 * - Infinite scrolling support
 */

import { useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CheckCircle, Circle, Clock, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ListSkeleton } from '@/components/ui/LoadingScreen';
import type { Task, TaskStatus, PaginatedResponse } from '@/types';

// ============================================================================
// API Layer - Replace with your actual API calls
// ============================================================================

interface FetchTasksParams {
  pageParam?: number;
  pageSize?: number;
  status?: TaskStatus;
}

// Simulated API that generates large datasets
async function fetchTasks({
  pageParam = 0,
  pageSize = 50,
  status,
}: FetchTasksParams): Promise<PaginatedResponse<Task>> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  // Generate mock tasks (in production, this would be an API call)
  const tasks: Task[] = Array.from({ length: pageSize }, (_, i) => {
    const index = pageParam * pageSize + i;
    return {
      id: `task-${index}`,
      title: `Task ${index + 1}: ${getRandomTitle()}`,
      description: `Description for task ${index + 1}`,
      status: status || getRandomStatus(),
      priority: getRandomPriority(),
      projectId: 'project-1',
      columnId: `col-${status || 'todo'}`,
      order: index,
      labels: [],
      dependencies: [],
      attachments: [],
      comments: [],
      assignee: Math.random() > 0.3 ? { id: 'user-1', name: 'John Doe' } : undefined,
      dueDate: Math.random() > 0.5 ? getRandomDueDate() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
    };
  });

  return {
    data: tasks,
    total: 1000, // Simulate 1000 total tasks
    page: pageParam,
    pageSize,
    hasMore: pageParam < 19, // 20 pages total
  };
}

// Response type for task status update (API returns partial data)
interface TaskStatusUpdateResponse {
  id: string;
  status: TaskStatus;
  updatedAt: Date;
}

async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<TaskStatusUpdateResponse> {
  await new Promise((r) => setTimeout(r, 200));
  // In production: return await fetch(`${API_BASE}/tasks/${taskId}`, { ... })
  return { id: taskId, status, updatedAt: new Date() };
}

// Helper functions for mock data
function getRandomTitle(): string {
  const titles = [
    'Implement feature',
    'Fix bug in module',
    'Write documentation',
    'Review pull request',
    'Update dependencies',
    'Refactor component',
    'Add unit tests',
    'Design system update',
    'API integration',
    'Performance optimization',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function getRandomStatus(): TaskStatus {
  const statuses: TaskStatus[] = ['todo', 'inProgress', 'review', 'done'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomPriority(): Task['priority'] {
  const priorities: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

function getRandomDueDate(): Date {
  const daysFromNow = Math.floor(Math.random() * 30) - 5;
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
}

// ============================================================================
// Task Row Component - Memoized for performance
// ============================================================================

interface TaskRowProps {
  task: Task;
  onStatusToggle: (taskId: string, currentStatus: TaskStatus) => void;
  style?: React.CSSProperties;
}

const TaskRow = ({ task, onStatusToggle, style }: TaskRowProps) => {
  const { t } = useTranslation();

  const statusIcon = {
    todo: <Circle className="h-5 w-5 text-muted-foreground" />,
    inProgress: <Clock className="h-5 w-5 text-blue-500" />,
    review: <Clock className="h-5 w-5 text-yellow-500" />,
    done: <CheckCircle className="h-5 w-5 text-green-500" />,
    blocked: <Circle className="h-5 w-5 text-red-500" />,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      style={style}
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b hover:bg-muted/50 transition-colors',
        task.status === 'done' && 'opacity-60'
      )}
    >
      {/* Status toggle */}
      <button
        onClick={() => onStatusToggle(task.id, task.status)}
        className="shrink-0 hover:scale-110 transition-transform"
        aria-label={t(`tasks.status.${task.status}`)}
      >
        {statusIcon[task.status]}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium truncate',
              task.status === 'done' && 'line-through'
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full shrink-0',
              priorityColors[task.priority]
            )}
          >
            {t(`tasks.priority.${task.priority}`)}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {task.description}
          </p>
        )}
      </div>

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{task.assignee.name}</span>
        </div>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm shrink-0',
            isOverdue ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          <Clock className="h-4 w-4" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Virtualized Task List Component
// ============================================================================

interface VirtualizedTaskListProps {
  status?: TaskStatus;
  className?: string;
}

export function VirtualizedTaskList({ status, className }: VirtualizedTaskListProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const parentRef = useRef<HTMLDivElement>(null);

  // Infinite query for paginated data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['tasks', { status }],
    queryFn: ({ pageParam }) => fetchTasks({ pageParam, status }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Flatten all pages into a single array
  const allTasks = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  // Optimistic update mutation
  const statusMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) =>
      updateTaskStatus(taskId, newStatus),
    onMutate: async ({ taskId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['tasks', { status }]);

      // Optimistically update the cache
      queryClient.setQueryData(['tasks', { status }], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((task) =>
              task.id === taskId ? { ...task, status: newStatus } : task
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['tasks', { status }], context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Toggle task status
  const handleStatusToggle = useCallback(
    (taskId: string, currentStatus: TaskStatus) => {
      const statusOrder: TaskStatus[] = ['todo', 'inProgress', 'review', 'done'];
      const currentIndex = statusOrder.indexOf(currentStatus);
      const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

      statusMutation.mutate({ taskId, newStatus });
    },
    [statusMutation]
  );

  // Set up virtualizer for windowed rendering
  const virtualizer = useVirtualizer({
    count: hasNextPage ? allTasks.length + 1 : allTasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 10, // Render 10 extra items for smooth scrolling
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Load more when scrolling near the end
  const lastItem = virtualItems[virtualItems.length - 1];
  if (
    lastItem &&
    lastItem.index >= allTasks.length - 1 &&
    hasNextPage &&
    !isFetchingNextPage
  ) {
    fetchNextPage();
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border', className)}>
        <div className="p-4 border-b">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <ListSkeleton count={8} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cn('rounded-lg border p-8 text-center', className)}>
        <p className="text-destructive">{t('common.error')}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
        >
          {t('common.refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">
          {status ? t(`tasks.status.${status}`) : t('tasks.filters.all')}
        </h3>
        <span className="text-sm text-muted-foreground">
          {allTasks.length} / {data?.pages[0]?.total ?? 0}
        </span>
      </div>

      {/* Virtualized list container */}
      <div
        ref={parentRef}
        className="overflow-auto scrollbar-thin"
        style={{ height: 'calc(100vh - 300px)', maxHeight: '600px' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoaderRow = virtualItem.index >= allTasks.length;
            const task = allTasks[virtualItem.index];

            if (isLoaderRow) {
              return (
                <div
                  key="loader"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="flex items-center justify-center p-4"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => fetchNextPage()}
                      disabled={!hasNextPage}
                    >
                      <ChevronDown className="h-4 w-4 me-2" />
                      {t('common.showMore')}
                    </Button>
                  )}
                </div>
              );
            }

            return (
              <TaskRow
                key={task.id}
                task={task}
                onStatusToggle={handleStatusToggle}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Footer with count */}
      {allTasks.length > 0 && (
        <div className="p-3 border-t text-center text-sm text-muted-foreground">
          {t('a11y.itemPosition', {
            current: allTasks.length,
            total: data?.pages[0]?.total ?? 0,
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example Usage
// ============================================================================

export default function TaskListExample() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('tasks.title')}</h1>
        <p className="text-muted-foreground">
          Virtualized list with 1000+ tasks, optimistic updates, and infinite scroll
        </p>
      </div>

      <VirtualizedTaskList />
    </div>
  );
}
