import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Plus, MoreHorizontal, GripVertical, Clock, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { TaskCardSkeleton } from '@/components/ui/LoadingScreen';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Task, TaskStatus, KanbanColumn, TaskMovedEvent } from '@/types';

// Mock API functions
const fetchKanbanBoard = async (): Promise<KanbanColumn[]> => {
  await new Promise((r) => setTimeout(r, 500));
  return [
    {
      id: 'col-1',
      title: 'To Do',
      status: 'todo',
      color: 'var(--kanban-todo)',
      order: 0,
      tasks: generateMockTasks('todo', 15),
    },
    {
      id: 'col-2',
      title: 'In Progress',
      status: 'inProgress',
      color: 'var(--kanban-in-progress)',
      order: 1,
      tasks: generateMockTasks('inProgress', 8),
    },
    {
      id: 'col-3',
      title: 'Review',
      status: 'review',
      color: 'var(--kanban-review)',
      order: 2,
      tasks: generateMockTasks('review', 5),
    },
    {
      id: 'col-4',
      title: 'Done',
      status: 'done',
      color: 'var(--kanban-done)',
      order: 3,
      tasks: generateMockTasks('done', 20),
    },
  ];
};

function generateMockTasks(status: TaskStatus, count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${status}-${i}`,
    title: `Task ${i + 1} - ${status}`,
    description: `Description for task ${i + 1}`,
    status,
    priority: (['low', 'medium', 'high', 'urgent'] as const)[Math.floor(Math.random() * 4)],
    projectId: 'project-1',
    columnId: `col-${status}`,
    order: i,
    labels: [],
    dependencies: [],
    attachments: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
  }));
}

const moveTask = async (data: {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  newOrder: number;
}): Promise<void> => {
  await new Promise((r) => setTimeout(r, 200));
  console.log('Task moved:', data);
};

// Sortable Task Card Component
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
}

function TaskCard({ task, isDragging, isOverlay }: TaskCardProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-lg border bg-card p-3 shadow-sm transition-shadow',
        'hover:shadow-md',
        (isDragging || isSortableDragging) && 'opacity-50',
        isOverlay && 'shadow-lg rotate-3 scale-105'
      )}
      {...attributes}
    >
      {/* Drag handle and priority */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            priorityColors[task.priority]
          )}
        >
          {t(`tasks.priority.${task.priority}`)}
        </span>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          {...listeners}
          aria-label={t('a11y.dragHandle')}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Task title */}
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

      {/* Task description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task metadata */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignee.name}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {task.labels.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{task.labels.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Virtualized Kanban Column
interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
}

function KanbanColumnComponent({ column, tasks }: KanbanColumnProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualize tasks for performance with 1000+ items
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated task card height
    overscan: 5,
  });

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div className="flex flex-col w-80 shrink-0 bg-muted/30 rounded-lg">
      {/* Column header */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: `hsl(${column.color})` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: `hsl(${column.color})` }}
          />
          <h3 className="font-semibold text-sm">{t(`kanban.columns.${column.status}`)}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Virtualized task list */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={parentRef}
          className="flex-1 overflow-auto p-2 space-y-2 scrollbar-thin"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const task = tasks[virtualItem.index];
              return (
                <div
                  key={task.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TaskCard task={task} />
                </div>
              );
            })}
          </div>
        </div>
      </SortableContext>

      {/* Add task button */}
      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <Plus className="h-4 w-4 me-2" />
          {t('kanban.addTask')}
        </Button>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export default function KanbanBoard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // WebSocket for real-time updates
  const { subscribe, emitTaskMoved } = useWebSocket();

  // Fetch kanban data
  const { data: columns, isLoading } = useQuery({
    queryKey: ['kanban-board'],
    queryFn: fetchKanbanBoard,
    staleTime: 5 * 60 * 1000,
  });

  // Optimistic update mutation
  const moveTaskMutation = useMutation({
    mutationFn: moveTask,
    onMutate: async ({ taskId, fromColumnId, toColumnId, newOrder }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['kanban-board'] });

      // Snapshot previous value
      const previousColumns = queryClient.getQueryData<KanbanColumn[]>(['kanban-board']);

      // Optimistically update
      queryClient.setQueryData<KanbanColumn[]>(['kanban-board'], (old) => {
        if (!old) return old;

        const newColumns = old.map((col) => ({ ...col, tasks: [...col.tasks] }));
        const fromCol = newColumns.find((c) => c.id === fromColumnId);
        const toCol = newColumns.find((c) => c.id === toColumnId);

        if (!fromCol || !toCol) return old;

        const taskIndex = fromCol.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return old;

        const [task] = fromCol.tasks.splice(taskIndex, 1);
        task.status = toCol.status;
        task.columnId = toColumnId;
        toCol.tasks.splice(newOrder, 0, task);

        return newColumns;
      });

      return { previousColumns };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousColumns) {
        queryClient.setQueryData(['kanban-board'], context.previousColumns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribe<TaskMovedEvent>('task:moved', () => {
      // Update local state from remote changes
      queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
    });

    return unsubscribe;
  }, [subscribe, queryClient]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !columns) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find columns
      const activeColumn = columns.find((col) =>
        col.tasks.some((t) => t.id === activeId)
      );
      const overColumn = columns.find(
        (col) => col.id === overId || col.tasks.some((t) => t.id === overId)
      );

      if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
        return;
      }

      // Task is being dragged to a different column
      const activeTask = activeColumn.tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      // Calculate new order
      const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);
      const newOrder = overIndex >= 0 ? overIndex : overColumn.tasks.length;

      // Emit WebSocket event for real-time sync
      emitTaskMoved({
        taskId: activeId,
        fromColumnId: activeColumn.id,
        toColumnId: overColumn.id,
        newOrder,
      });
    },
    [columns, emitTaskMoved]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over || !columns) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find source and destination columns
      const activeColumn = columns.find((col) =>
        col.tasks.some((t) => t.id === activeId)
      );
      const overColumn = columns.find(
        (col) => col.id === overId || col.tasks.some((t) => t.id === overId)
      );

      if (!activeColumn || !overColumn) return;

      const activeIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
      const overIndex =
        overColumn.id === overId
          ? overColumn.tasks.length
          : overColumn.tasks.findIndex((t) => t.id === overId);

      // Same column reorder
      if (activeColumn.id === overColumn.id && activeIndex !== overIndex) {
        const newTasks = arrayMove(activeColumn.tasks, activeIndex, overIndex);
        queryClient.setQueryData<KanbanColumn[]>(['kanban-board'], (old) =>
          old?.map((col) =>
            col.id === activeColumn.id ? { ...col, tasks: newTasks } : col
          )
        );
      }
      // Different column move
      else if (activeColumn.id !== overColumn.id) {
        moveTaskMutation.mutate({
          taskId: activeId,
          fromColumnId: activeColumn.id,
          toColumnId: overColumn.id,
          newOrder: overIndex >= 0 ? overIndex : overColumn.tasks.length,
        });
      }
    },
    [columns, queryClient, moveTaskMutation]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('kanban.title')}</h1>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-80 shrink-0 bg-muted/30 rounded-lg p-3 space-y-2">
              {[1, 2, 3].map((j) => (
                <TaskCardSkeleton key={j} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('kanban.title')}</h1>
        <Button>
          <Plus className="h-4 w-4 me-2" />
          {t('kanban.addColumn')}
        </Button>
      </div>

      {/* Kanban board with drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {columns?.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              tasks={column.tasks}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
