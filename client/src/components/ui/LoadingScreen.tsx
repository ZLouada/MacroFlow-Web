import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative h-12 w-12">
          <div
            className={cn(
              'absolute inset-0 rounded-full border-4 border-muted',
              'animate-spin border-t-primary'
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'rectangular' && 'rounded-md',
        className
      )}
      aria-hidden="true"
    />
  );
}

// Card skeleton for loading states
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="mb-3 h-5 w-2/3" variant="text" />
      <Skeleton className="mb-2 h-4 w-full" variant="text" />
      <Skeleton className="mb-4 h-4 w-4/5" variant="text" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" variant="circular" />
        <Skeleton className="h-4 w-24" variant="text" />
      </div>
    </div>
  );
}

// Task card skeleton
export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-2 flex items-start justify-between">
        <Skeleton className="h-4 w-16" variant="text" />
        <Skeleton className="h-4 w-4" variant="circular" />
      </div>
      <Skeleton className="mb-2 h-5 w-full" variant="text" />
      <Skeleton className="mb-3 h-4 w-3/4" variant="text" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-6" variant="circular" />
        <Skeleton className="h-4 w-20" variant="text" />
      </div>
    </div>
  );
}

// List skeleton for virtualized lists
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border p-3">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-1/3" variant="text" />
            <Skeleton className="h-3 w-2/3" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}
