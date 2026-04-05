/**
 * Enhanced Shimmer Skeletons
 * 
 * Shape-aware loading skeletons that match the exact shape of incoming data,
 * creating a smoother perceived loading experience.
 */

import { cn } from '@/lib/utils';

// ============================================================================
// Base Shimmer Component
// ============================================================================

interface ShimmerProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Shimmer({ className, animate = true, style }: ShimmerProps) {
  return (
    <div
      className={cn(
        'rounded-md',
        animate ? 'shimmer' : 'bg-muted',
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Gantt Chart Skeleton
// ============================================================================

export function GanttChartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-24 rounded-full" />
          <Shimmer className="h-8 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Timeline header */}
      <div className="flex border-b pb-2">
        <Shimmer className="w-48 h-10 shrink-0" />
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <Shimmer key={i} className="flex-1 h-10" />
          ))}
        </div>
      </div>
      
      {/* Task rows with bars */}
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-2">
          {/* Task name */}
          <Shimmer className="w-48 h-12 shrink-0" />
          
          {/* Timeline with bar */}
          <div className="flex-1 relative h-12">
            {/* Gantt bar - random position and width */}
            <Shimmer
              className="absolute h-8 top-2 rounded-full"
              style={{
                left: `${rowIndex * 10 + 5}%`,
                width: `${20 + rowIndex * 5}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Kanban Card Skeleton
// ============================================================================

export function KanbanCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card/80 p-3 space-y-3">
      {/* Priority badge */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-16 rounded-full" />
        <Shimmer className="h-4 w-4" />
      </div>
      
      {/* Title */}
      <Shimmer className="h-5 w-full" />
      
      {/* Description */}
      <div className="space-y-1">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Shimmer className="h-6 w-6 rounded-full" />
        <Shimmer className="h-4 w-20" />
      </div>
    </div>
  );
}

// ============================================================================
// Kanban Column Skeleton
// ============================================================================

export function KanbanColumnSkeleton({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <div className="w-80 shrink-0 rounded-lg bg-muted/30 p-3">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shimmer className="h-3 w-3 rounded-full" />
          <Shimmer className="h-5 w-24" />
          <Shimmer className="h-5 w-8 rounded-full" />
        </div>
        <div className="flex gap-1">
          <Shimmer className="h-7 w-7 rounded" />
          <Shimmer className="h-7 w-7 rounded" />
        </div>
      </div>
      
      {/* Cards */}
      <div className="space-y-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <KanbanCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Add button */}
      <div className="mt-2 pt-2 border-t">
        <Shimmer className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard Widget Skeleton
// ============================================================================

export function WidgetSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };
  
  return (
    <div className={cn(
      'rounded-2xl border bg-card/80 p-4',
      heights[size]
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shimmer className="h-8 w-8 rounded-lg" />
          <div>
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-3 w-16 mt-1" />
          </div>
        </div>
        <Shimmer className="h-6 w-6 rounded" />
      </div>
      
      {/* Content varies by size */}
      {size === 'sm' && (
        <div className="flex items-end justify-between">
          <Shimmer className="h-10 w-20" />
          <Shimmer className="h-4 w-16" />
        </div>
      )}
      
      {size === 'md' && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-3 w-2/3 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {size === 'lg' && (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-end gap-1 pb-4">
            {/* Bar chart skeleton */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Shimmer
                  className="w-full rounded-t"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Bento Grid Skeleton
// ============================================================================

export function BentoGridSkeleton() {
  return (
    <div className="bento-grid">
      <WidgetSkeleton size="lg" />
      <WidgetSkeleton size="sm" />
      <WidgetSkeleton size="sm" />
      <WidgetSkeleton size="md" />
      <WidgetSkeleton size="md" />
      <WidgetSkeleton size="sm" />
    </div>
  );
}

// ============================================================================
// Task List Skeleton
// ============================================================================

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card/50"
        >
          {/* Checkbox */}
          <Shimmer className="h-5 w-5 rounded-full shrink-0" />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-1/2 mt-1" />
          </div>
          
          {/* Priority */}
          <Shimmer className="h-5 w-16 rounded-full shrink-0" />
          
          {/* Assignee */}
          <Shimmer className="h-8 w-8 rounded-full shrink-0" />
          
          {/* Due date */}
          <Shimmer className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// User Card Skeleton
// ============================================================================

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
      <Shimmer className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-24 mt-1" />
      </div>
      <Shimmer className="h-8 w-8 rounded-lg shrink-0" />
    </div>
  );
}

// ============================================================================
// Comment Skeleton
// ============================================================================

export function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-3">
      <Shimmer className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default Shimmer;
