import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingScreen';
import { WidgetType, DEFAULT_WIDGETS_BY_ROLE, UserRole } from '@/types';

// Widget component registry
interface WidgetProps {
  className?: string;
}

// Tasks Summary Widget
function TasksSummaryWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks-summary'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 500));
      return {
        completed: 127,
        inProgress: 34,
        pending: 18,
        overdue: 5,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  const stats = [
    {
      label: t('dashboard.widgets.tasksCompleted'),
      value: data?.completed ?? 0,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: t('dashboard.widgets.tasksInProgress'),
      value: data?.inProgress ?? 0,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: t('dashboard.widgets.tasksPending'),
      value: data?.pending ?? 0,
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
    {
      label: t('dashboard.stats.overdue'),
      value: data?.overdue ?? 0,
      icon: Calendar,
      color: 'text-red-500',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.stats.totalTasks')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon className={cn('h-5 w-5', stat.color)} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Project Progress Widget
function ProjectProgressWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['project-progress'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 600));
      return {
        projects: [
          { name: 'Project Alpha', progress: 75 },
          { name: 'Project Beta', progress: 45 },
          { name: 'Project Gamma', progress: 90 },
        ],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {t('dashboard.widgets.projectProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data?.projects.map((project) => (
          <div key={project.name}>
            <div className="flex justify-between text-sm mb-1">
              <span>{project.name}</span>
              <span className="text-muted-foreground">{project.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Team Velocity Widget
function TeamVelocityWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['team-velocity'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      return {
        currentSprint: 34,
        previousSprint: 28,
        trend: 'up' as const,
        weeklyData: [28, 32, 25, 34, 38, 32, 36],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t('dashboard.widgets.teamVelocity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{data?.currentSprint}</span>
          <span className="text-sm text-muted-foreground mb-1">points/sprint</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm">
          {data?.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
          )}
          <span className={data?.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {Math.round(
              ((data?.currentSprint ?? 0) / (data?.previousSprint ?? 1) - 1) * 100
            )}
            %
          </span>
          <span className="text-muted-foreground">vs last sprint</span>
        </div>
        {/* Simple bar chart */}
        <div className="mt-4 flex items-end gap-1 h-16">
          {data?.weeklyData.map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-t"
              style={{ height: `${(value / Math.max(...(data?.weeklyData ?? [1]))) * 100}%` }}
            >
              <div
                className="w-full bg-primary rounded-t transition-all"
                style={{ height: `${(value / Math.max(...(data?.weeklyData ?? [1]))) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Upcoming Deadlines Widget
function UpcomingDeadlinesWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return {
        tasks: [
          { id: '1', title: 'Design review', dueDate: 'Today', priority: 'high' },
          { id: '2', title: 'API integration', dueDate: 'Tomorrow', priority: 'medium' },
          { id: '3', title: 'Documentation', dueDate: 'In 3 days', priority: 'low' },
        ],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('dashboard.upcomingDeadlines')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.dueDate}</p>
              </div>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  task.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  task.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                  task.priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                )}
              >
                {t(`tasks.priority.${task.priority}`)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Team Members Widget
function TeamMembersWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      return {
        members: [
          { id: '1', name: 'Alice', status: 'online', tasks: 5 },
          { id: '2', name: 'Bob', status: 'online', tasks: 3 },
          { id: '3', name: 'Charlie', status: 'away', tasks: 7 },
          { id: '4', name: 'Diana', status: 'offline', tasks: 2 },
        ],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('nav.team')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data?.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {member.name[0]}
                  </div>
                  <span
                    className={cn(
                      'absolute bottom-0 end-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                      member.status === 'online' && 'bg-green-500',
                      member.status === 'away' && 'bg-yellow-500',
                      member.status === 'offline' && 'bg-gray-400'
                    )}
                  />
                </div>
                <span className="text-sm">{member.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {member.tasks} tasks
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Widget
function QuickActionsWidget({ className }: WidgetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    { key: 'newTask', icon: Zap, label: t('tasks.newTask'), path: '/kanban' },
    { key: 'viewAll', icon: Activity, label: t('common.viewAll'), path: '/kanban' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Widget
function RecentActivityWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      return {
        activities: [
          { id: '1', user: 'Alice', action: 'completed', target: 'Design review', time: '2m ago' },
          { id: '2', user: 'Bob', action: 'commented on', target: 'API spec', time: '15m ago' },
          { id: '3', user: 'Charlie', action: 'created', target: 'New feature', time: '1h ago' },
        ],
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.teamActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2 text-sm">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0">
                {activity.user[0]}
              </div>
              <div>
                <p>
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// My Tasks Widget
function MyTasksWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return {
        tasks: [
          { id: '1', title: 'Review PR #234', status: 'inProgress' },
          { id: '2', title: 'Update documentation', status: 'todo' },
          { id: '3', title: 'Fix login bug', status: 'review' },
        ],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <WidgetSkeleton className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.myTasks')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data?.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
            >
              <span className="text-sm">{task.title}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  task.status === 'todo' && 'bg-muted text-muted-foreground',
                  task.status === 'inProgress' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  task.status === 'review' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                )}
              >
                {t(`tasks.status.${task.status}`)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Burndown Chart Widget (Placeholder)
function BurndownChartWidget({ className }: WidgetProps) {
  const { t } = useTranslation();

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('dashboard.widgets.burndownChart')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          Chart visualization placeholder
        </div>
      </CardContent>
    </Card>
  );
}

// Widget skeleton for loading states
function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" variant="text" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
      </CardContent>
    </Card>
  );
}

// Widget registry
const WIDGET_COMPONENTS: Record<WidgetType, React.FC<WidgetProps>> = {
  tasksSummary: TasksSummaryWidget,
  projectProgress: ProjectProgressWidget,
  teamVelocity: TeamVelocityWidget,
  burndownChart: BurndownChartWidget,
  upcomingDeadlines: UpcomingDeadlinesWidget,
  recentActivity: RecentActivityWidget,
  myTasks: MyTasksWidget,
  teamMembers: TeamMembersWidget,
  quickActions: QuickActionsWidget,
};

// Widget sizes for grid layout
const WIDGET_SIZES: Record<WidgetType, string> = {
  tasksSummary: 'col-span-2',
  projectProgress: 'col-span-1',
  teamVelocity: 'col-span-1',
  burndownChart: 'col-span-2',
  upcomingDeadlines: 'col-span-1',
  recentActivity: 'col-span-1',
  myTasks: 'col-span-1',
  teamMembers: 'col-span-1',
  quickActions: 'col-span-1',
};

// Main Dashboard Widget Grid
interface DashboardWidgetGridProps {
  role?: UserRole;
  customWidgets?: WidgetType[];
}

export function DashboardWidgetGrid({
  role = 'developer',
  customWidgets,
}: DashboardWidgetGridProps) {
  const widgets = useMemo(() => {
    return customWidgets ?? DEFAULT_WIDGETS_BY_ROLE[role] ?? [];
  }, [role, customWidgets]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((widgetType) => {
        const Component = WIDGET_COMPONENTS[widgetType];
        const sizeClass = WIDGET_SIZES[widgetType];

        if (!Component) return null;

        return (
          <Component
            key={widgetType}
            className={cn(sizeClass, 'min-h-[180px]')}
          />
        );
      })}
    </div>
  );
}

// Export individual widgets for custom layouts
export {
  TasksSummaryWidget,
  ProjectProgressWidget,
  TeamVelocityWidget,
  BurndownChartWidget,
  UpcomingDeadlinesWidget,
  RecentActivityWidget,
  MyTasksWidget,
  TeamMembersWidget,
  QuickActionsWidget,
  WidgetSkeleton,
};
