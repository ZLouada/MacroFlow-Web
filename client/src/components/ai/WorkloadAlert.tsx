/**
 * Workload Alert Component
 * 
 * Displays predictive burnout risk indicators for team members.
 * Highlights users with high workloads and suggests task reassignment.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  ArrowRight,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analyzeWorkload, type WorkloadAnalysis } from '@/lib/ai';
import type { Task } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface WorkloadAlertProps {
  tasks?: Task[];
  className?: string;
  compact?: boolean;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockUsers = [
  { id: 'user-1', name: 'Alice Johnson' },
  { id: 'user-2', name: 'Bob Smith' },
  { id: 'user-3', name: 'Salma Hassan' },
  { id: 'user-4', name: 'Charlie Brown' },
  { id: 'user-5', name: 'Diana Prince' },
];

const generateMockTasks = (): Task[] => {
  const now = new Date();
  const tasks: Task[] = [];
  
  // Generate tasks with various due dates and assignments
  mockUsers.forEach((user, userIndex) => {
    const taskCount = userIndex === 0 ? 12 : userIndex === 2 ? 15 : 5; // Overload some users
    
    for (let i = 0; i < taskCount; i++) {
      const daysOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2 days
      const dueDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      
      tasks.push({
        id: `task-${user.id}-${i}`,
        title: `Task ${i + 1} for ${user.name}`,
        description: 'Task description',
        status: Math.random() > 0.7 ? 'done' : 'inProgress',
        priority: (['low', 'medium', 'high', 'urgent'] as const)[Math.floor(Math.random() * 4)],
        assigneeId: user.id,
        assignee: { id: user.id, name: user.name },
        projectId: 'project-1',
        columnId: 'col-1',
        order: i,
        labels: [],
        dependencies: [],
        attachments: [],
        comments: [],
        dueDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
      });
    }
  });
  
  return tasks;
};

// ============================================================================
// Sub-components
// ============================================================================

interface RiskIndicatorProps {
  level: WorkloadAnalysis['riskLevel'];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function RiskIndicator({ level, size = 'md', showLabel = false }: RiskIndicatorProps) {
  const { t } = useTranslation();
  
  const config = {
    low: {
      color: 'text-green-500',
      bg: 'bg-green-500',
      ring: 'ring-green-500/30',
      icon: Shield,
      label: t('workload.riskLevels.low'),
    },
    medium: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500',
      ring: 'ring-yellow-500/30',
      icon: Zap,
      label: t('workload.riskLevels.medium'),
    },
    high: {
      color: 'text-orange-500',
      bg: 'bg-orange-500',
      ring: 'ring-orange-500/30',
      icon: AlertTriangle,
      label: t('workload.riskLevels.high'),
    },
    critical: {
      color: 'text-red-500',
      bg: 'bg-red-500',
      ring: 'ring-red-500/30',
      icon: Flame,
      label: t('workload.riskLevels.critical'),
    },
  };
  
  const { color, bg, ring, icon: Icon, label } = config[level];
  
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'relative flex items-center justify-center rounded-full',
        sizeClasses[size],
        bg,
        'text-white',
        level === 'critical' && 'animate-pulse'
      )}>
        {/* Pulsing ring for high/critical */}
        {(level === 'high' || level === 'critical') && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', ring)}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <Icon className={cn(
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )} />
      </div>
      {showLabel && (
        <span className={cn('font-medium', color)}>{label}</span>
      )}
    </div>
  );
}

interface UserWorkloadCardProps {
  analysis: WorkloadAnalysis;
  onReassign?: () => void;
}

function UserWorkloadCard({ analysis, onReassign }: UserWorkloadCardProps) {
  const { t } = useTranslation();
  
  const isAtRisk = analysis.riskLevel === 'high' || analysis.riskLevel === 'critical';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        isAtRisk
          ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
          : 'bg-card hover:bg-muted/50'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with risk indicator */}
        <div className="relative">
          <div className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold',
            isAtRisk
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          )}>
            {analysis.userName.charAt(0)}
          </div>
          <div className="absolute -bottom-1 -end-1">
            <RiskIndicator level={analysis.riskLevel} size="sm" />
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold truncate">{analysis.userName}</h4>
            {isAtRisk && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                {t('workload.burnoutRisk')}
              </span>
            )}
          </div>
          
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(
                analysis.tasksDueIn48h >= 7 && 'text-destructive font-medium'
              )}>
                {analysis.tasksDueIn48h} {t('workload.dueIn48h')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{analysis.totalActiveTasks} {t('workload.active')}</span>
            </div>
            <div className="flex items-center gap-1">
              {analysis.averageCompletionRate >= 70 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-orange-500" />
              )}
              <span>{analysis.averageCompletionRate}%</span>
            </div>
          </div>
          
          {/* Recommendation */}
          <p className="mt-2 text-xs text-muted-foreground">
            {analysis.recommendation}
          </p>
        </div>
      </div>
      
      {/* Actions for at-risk users */}
      {isAtRisk && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {analysis.overdueTasks} {t('workload.overdue')}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onReassign}
            className="text-xs"
          >
            {t('workload.reassignTasks')}
            <ArrowRight className="h-3 w-3 ms-1" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function WorkloadAlert({ tasks, className, compact }: WorkloadAlertProps) {
  const { t } = useTranslation();
  
  // Fetch or use provided tasks
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['workload-analysis'],
    queryFn: async () => {
      const allTasks = tasks || generateMockTasks();
      return analyzeWorkload(allTasks, mockUsers);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Sort by risk level
  const sortedAnalysis = useMemo(() => {
    if (!analysisData) return [];
    
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...analysisData].sort((a, b) => 
      riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
    );
  }, [analysisData]);
  
  // Count by risk level
  const riskCounts = useMemo(() => {
    if (!sortedAnalysis) return { critical: 0, high: 0, medium: 0, low: 0 };
    
    return sortedAnalysis.reduce((acc, item) => {
      acc[item.riskLevel]++;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
  }, [sortedAnalysis]);
  
  const hasAtRisk = riskCounts.critical > 0 || riskCounts.high > 0;
  
  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-5 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Compact view for dashboard widget
  if (compact) {
    return (
      <Card className={cn(
        hasAtRisk && 'border-destructive/50',
        className
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {hasAtRisk ? (
              <>
                <AlertTriangle className="h-4 w-4 text-destructive" />
                {t('workload.alertTitle')}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-green-500" />
                {t('workload.healthyTitle')}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {riskCounts.critical > 0 && (
                <div className="flex items-center gap-1">
                  <RiskIndicator level="critical" size="sm" />
                  <span className="text-sm font-medium">{riskCounts.critical}</span>
                </div>
              )}
              {riskCounts.high > 0 && (
                <div className="flex items-center gap-1">
                  <RiskIndicator level="high" size="sm" />
                  <span className="text-sm font-medium">{riskCounts.high}</span>
                </div>
              )}
              {riskCounts.medium > 0 && (
                <div className="flex items-center gap-1">
                  <RiskIndicator level="medium" size="sm" />
                  <span className="text-sm font-medium">{riskCounts.medium}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <RiskIndicator level="low" size="sm" />
                <span className="text-sm font-medium">{riskCounts.low}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {t('common.viewAll')}
              <ArrowRight className="h-3 w-3 ms-1" />
            </Button>
          </div>
          
          {/* Show top at-risk user */}
          {hasAtRisk && sortedAnalysis[0] && (
            <div className="mt-3 p-2 rounded-lg bg-destructive/5 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-semibold text-destructive">
                {sortedAnalysis[0].userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{sortedAnalysis[0].userName}</p>
                <p className="text-xs text-muted-foreground">
                  {sortedAnalysis[0].tasksDueIn48h} tasks due in 48h
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Full view
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t('workload.teamWorkload')}
          </span>
          {hasAtRisk && (
            <span className="text-sm font-normal px-3 py-1 rounded-full bg-destructive/10 text-destructive">
              {riskCounts.critical + riskCounts.high} {t('workload.atRisk')}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {sortedAnalysis.map(analysis => (
              <UserWorkloadCard
                key={analysis.userId}
                analysis={analysis}
                onReassign={() => {
                  // TODO: Open reassignment modal
                  console.log('Reassign tasks for', analysis.userName);
                }}
              />
            ))}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default WorkloadAlert;
