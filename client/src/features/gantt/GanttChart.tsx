import { useState, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Milestone,
} from 'lucide-react';
import { format, addDays, startOfWeek, differenceInDays, addMonths, addQuarters } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingScreen';
import type { GanttTask } from '@/types';

// Zoom level configuration
type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

const ZOOM_CONFIG: Record<ZoomLevel, { cellWidth: number; format: string; cells: number }> = {
  day: { cellWidth: 40, format: 'dd', cells: 30 },
  week: { cellWidth: 100, format: "'W'w", cells: 12 },
  month: { cellWidth: 150, format: 'MMM yyyy', cells: 12 },
  quarter: { cellWidth: 200, format: "'Q'Q yyyy", cells: 8 },
};

// Mock data generator
const fetchGanttTasks = async (): Promise<GanttTask[]> => {
  await new Promise((r) => setTimeout(r, 600));
  
  const today = new Date();
  const tasks: GanttTask[] = [
    {
      id: 'task-1',
      title: 'Project Planning',
      description: 'Initial project planning and requirements gathering',
      status: 'done',
      priority: 'high',
      projectId: 'project-1',
      columnId: 'col-done',
      order: 0,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, -20),
      endDate: addDays(today, -10),
      progress: 100,
      isMilestone: false,
      ganttDependencies: [],
    },
    {
      id: 'task-2',
      title: 'Design Phase',
      description: 'UI/UX design and prototyping',
      status: 'done',
      priority: 'high',
      projectId: 'project-1',
      columnId: 'col-done',
      order: 1,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, -10),
      endDate: addDays(today, -3),
      progress: 100,
      isMilestone: false,
      ganttDependencies: [{ id: 'dep-1', fromTaskId: 'task-1', toTaskId: 'task-2', type: 'finish-to-start' }],
    },
    {
      id: 'milestone-1',
      title: 'Design Approval',
      description: 'Design milestone',
      status: 'done',
      priority: 'high',
      projectId: 'project-1',
      columnId: 'col-done',
      order: 2,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, -3),
      endDate: addDays(today, -3),
      progress: 100,
      isMilestone: true,
      ganttDependencies: [],
    },
    {
      id: 'task-3',
      title: 'Frontend Development',
      description: 'React components and UI implementation',
      status: 'inProgress',
      priority: 'high',
      projectId: 'project-1',
      columnId: 'col-inProgress',
      order: 3,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, -3),
      endDate: addDays(today, 10),
      progress: 45,
      isMilestone: false,
      ganttDependencies: [{ id: 'dep-2', fromTaskId: 'milestone-1', toTaskId: 'task-3', type: 'finish-to-start' }],
    },
    {
      id: 'task-4',
      title: 'Backend Development',
      description: 'API development and database setup',
      status: 'inProgress',
      priority: 'high',
      projectId: 'project-1',
      columnId: 'col-inProgress',
      order: 4,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, -3),
      endDate: addDays(today, 14),
      progress: 30,
      isMilestone: false,
      ganttDependencies: [{ id: 'dep-3', fromTaskId: 'milestone-1', toTaskId: 'task-4', type: 'finish-to-start' }],
    },
    {
      id: 'task-5',
      title: 'Integration & Testing',
      description: 'System integration and QA testing',
      status: 'todo',
      priority: 'medium',
      projectId: 'project-1',
      columnId: 'col-todo',
      order: 5,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, 15),
      endDate: addDays(today, 25),
      progress: 0,
      isMilestone: false,
      ganttDependencies: [
        { id: 'dep-4', fromTaskId: 'task-3', toTaskId: 'task-5', type: 'finish-to-start' },
        { id: 'dep-5', fromTaskId: 'task-4', toTaskId: 'task-5', type: 'finish-to-start' },
      ],
    },
    {
      id: 'milestone-2',
      title: 'Release v1.0',
      description: 'Production release',
      status: 'todo',
      priority: 'urgent',
      projectId: 'project-1',
      columnId: 'col-todo',
      order: 6,
      labels: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1',
      startDate: addDays(today, 26),
      endDate: addDays(today, 26),
      progress: 0,
      isMilestone: true,
      ganttDependencies: [{ id: 'dep-6', fromTaskId: 'task-5', toTaskId: 'milestone-2', type: 'finish-to-start' }],
    },
  ];
  
  return tasks;
};

// Task bar component
interface TaskBarProps {
  task: GanttTask;
  startDate: Date;
  cellWidth: number;
  rowHeight: number;
}

function TaskBar({ task, startDate, cellWidth, rowHeight }: TaskBarProps) {
  const taskStart = differenceInDays(task.startDate, startDate);
  const taskDuration = differenceInDays(task.endDate, task.startDate) + 1;
  
  const left = taskStart * cellWidth;
  const width = taskDuration * cellWidth;
  
  const statusColors = {
    todo: 'bg-muted',
    inProgress: 'bg-primary',
    review: 'bg-yellow-500',
    done: 'bg-green-500',
    blocked: 'bg-red-500',
  };
  
  if (task.isMilestone) {
    return (
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: left + cellWidth / 2 - 10,
          top: (rowHeight - 20) / 2,
          width: 20,
          height: 20,
        }}
      >
        <div
          className={cn(
            'w-4 h-4 rotate-45 border-2',
            task.progress === 100 ? 'bg-green-500 border-green-600' : 'bg-primary border-primary'
          )}
          title={task.title}
        />
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        'absolute rounded-md overflow-hidden cursor-pointer group',
        'hover:ring-2 hover:ring-primary hover:ring-offset-2'
      )}
      style={{
        left,
        top: (rowHeight - 28) / 2,
        width: Math.max(width, cellWidth),
        height: 28,
      }}
      title={`${task.title} (${task.progress}%)`}
    >
      {/* Background */}
      <div className={cn('absolute inset-0 opacity-30', statusColors[task.status])} />
      
      {/* Progress */}
      <div
        className={cn('absolute inset-y-0 start-0', statusColors[task.status])}
        style={{ width: `${task.progress}%` }}
      />
      
      {/* Label */}
      <div className="absolute inset-0 flex items-center px-2">
        <span className="text-xs font-medium truncate text-foreground">
          {task.title}
        </span>
      </div>
    </div>
  );
}

// Dependency line component
function DependencyLine({
  fromTask,
  toTask,
  startDate,
  cellWidth,
  rowHeight,
  taskIndex,
}: {
  fromTask: GanttTask;
  toTask: GanttTask;
  startDate: Date;
  cellWidth: number;
  rowHeight: number;
  taskIndex: Map<string, number>;
}) {
  const fromEnd = differenceInDays(fromTask.endDate, startDate) * cellWidth + cellWidth;
  const fromY = (taskIndex.get(fromTask.id) ?? 0) * rowHeight + rowHeight / 2;
  
  const toStart = differenceInDays(toTask.startDate, startDate) * cellWidth;
  const toY = (taskIndex.get(toTask.id) ?? 0) * rowHeight + rowHeight / 2;
  
  // Simple path from end of fromTask to start of toTask
  const midX = fromEnd + (toStart - fromEnd) / 2;
  
  const path = `M ${fromEnd} ${fromY} H ${midX} V ${toY} H ${toStart}`;
  
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-muted-foreground"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="currentColor" className="text-muted-foreground" />
        </marker>
      </defs>
    </svg>
  );
}

// Main Gantt Chart Component
export default function GanttChart() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [viewStartDate, setViewStartDate] = useState(() => startOfWeek(new Date()));
  
  const config = ZOOM_CONFIG[zoomLevel];
  const ROW_HEIGHT = 48;
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['gantt-tasks'],
    queryFn: fetchGanttTasks,
    staleTime: 5 * 60 * 1000,
  });
  
  // Generate date headers based on zoom level
  const dateHeaders = useMemo(() => {
    const headers: { date: Date; label: string }[] = [];
    let currentDate = viewStartDate;
    
    for (let i = 0; i < config.cells; i++) {
      headers.push({
        date: currentDate,
        label: format(currentDate, config.format),
      });
      
      switch (zoomLevel) {
        case 'day':
          currentDate = addDays(currentDate, 1);
          break;
        case 'week':
          currentDate = addDays(currentDate, 7);
          break;
        case 'month':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'quarter':
          currentDate = addQuarters(currentDate, 1);
          break;
      }
    }
    
    return headers;
  }, [viewStartDate, zoomLevel, config]);
  
  // Task index map for dependency lines
  const taskIndex = useMemo(() => {
    const map = new Map<string, number>();
    tasks?.forEach((task, index) => map.set(task.id, index));
    return map;
  }, [tasks]);
  
  // Navigation handlers
  const navigateBackward = useCallback(() => {
    switch (zoomLevel) {
      case 'day':
        setViewStartDate((d) => addDays(d, -7));
        break;
      case 'week':
        setViewStartDate((d) => addDays(d, -28));
        break;
      case 'month':
        setViewStartDate((d) => addMonths(d, -3));
        break;
      case 'quarter':
        setViewStartDate((d) => addQuarters(d, -2));
        break;
    }
  }, [zoomLevel]);
  
  const navigateForward = useCallback(() => {
    switch (zoomLevel) {
      case 'day':
        setViewStartDate((d) => addDays(d, 7));
        break;
      case 'week':
        setViewStartDate((d) => addDays(d, 28));
        break;
      case 'month':
        setViewStartDate((d) => addMonths(d, 3));
        break;
      case 'quarter':
        setViewStartDate((d) => addQuarters(d, 2));
        break;
    }
  }, [zoomLevel]);
  
  const scrollToToday = useCallback(() => {
    setViewStartDate(startOfWeek(new Date()));
  }, []);
  
  // Check if today is visible
  const today = new Date();
  const todayOffset = differenceInDays(today, viewStartDate);
  const isTodayVisible = todayOffset >= 0 && todayOffset < config.cells * 7;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('gantt.title')}</h1>
        </div>
        <Card className="p-4">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">{t('gantt.title')}</h1>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center border rounded-md">
            {(['day', 'week', 'month', 'quarter'] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoomLevel(level)}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors',
                  zoomLevel === level
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {t(`gantt.zoom.${level}`)}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={navigateBackward}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={scrollToToday}>
              {t('gantt.today')}
            </Button>
            <Button variant="outline" size="icon" onClick={navigateForward}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Gantt chart */}
      <Card className="overflow-hidden">
        <div className="flex">
          {/* Task list (left panel) */}
          <div className="w-64 shrink-0 border-e">
            {/* Header */}
            <div className="h-12 border-b bg-muted/50 flex items-center px-4">
              <span className="font-medium text-sm">{t('tasks.title')}</span>
            </div>
            
            {/* Task rows */}
            {tasks?.map((task) => (
              <div
                key={task.id}
                className="flex items-center px-4 border-b hover:bg-muted/30"
                style={{ height: ROW_HEIGHT }}
              >
                {task.isMilestone ? (
                  <Milestone className="h-4 w-4 me-2 text-primary" />
                ) : (
                  <Calendar className="h-4 w-4 me-2 text-muted-foreground" />
                )}
                <span className="text-sm truncate">{task.title}</span>
              </div>
            ))}
          </div>
          
          {/* Timeline (right panel) */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-thin"
          >
            <div style={{ width: config.cellWidth * config.cells }}>
              {/* Date headers */}
              <div className="h-12 border-b bg-muted/50 flex">
                {dateHeaders.map((header, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center border-e text-sm"
                    style={{ width: config.cellWidth }}
                  >
                    {header.label}
                  </div>
                ))}
              </div>
              
              {/* Task bars */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {dateHeaders.map((_, i) => (
                    <div
                      key={i}
                      className="border-e border-dashed"
                      style={{ width: config.cellWidth }}
                    />
                  ))}
                </div>
                
                {/* Today line */}
                {isTodayVisible && zoomLevel === 'day' && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: todayOffset * config.cellWidth + config.cellWidth / 2 }}
                  />
                )}
                
                {/* Task rows */}
                {tasks?.map((task) => (
                  <div
                    key={task.id}
                    className="relative border-b"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <TaskBar
                      task={task}
                      startDate={viewStartDate}
                      cellWidth={zoomLevel === 'day' ? config.cellWidth : config.cellWidth / 7}
                      rowHeight={ROW_HEIGHT}
                    />
                  </div>
                ))}
                
                {/* Dependency lines */}
                {tasks?.map((task) =>
                  task.ganttDependencies.map((dep) => {
                    const fromTask = tasks.find((t) => t.id === dep.fromTaskId);
                    if (!fromTask) return null;
                    
                    return (
                      <DependencyLine
                        key={dep.id}
                        fromTask={fromTask}
                        toTask={task}
                        startDate={viewStartDate}
                        cellWidth={zoomLevel === 'day' ? config.cellWidth : config.cellWidth / 7}
                        rowHeight={ROW_HEIGHT}
                        taskIndex={taskIndex}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
