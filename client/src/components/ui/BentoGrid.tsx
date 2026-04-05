/**
 * Bento Grid Component
 * 
 * A modern, responsive grid layout system inspired by Apple's bento-box design.
 * Supports various item sizes and glassmorphism styling.
 */

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type BentoSize = 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'full';

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
}

interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  size?: BentoSize;
  glass?: boolean;
  interactive?: boolean;
}

// ============================================================================
// Bento Grid Container
// ============================================================================

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 4, gap = 'md', children, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };
    
    const columnClasses = {
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2',
          columnClasses[columns],
          gapClasses[gap],
          'auto-rows-[minmax(120px,auto)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoGrid.displayName = 'BentoGrid';

// ============================================================================
// Bento Grid Item
// ============================================================================

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(
  ({ className, size = 'sm', glass = true, interactive = true, children, ...props }, ref) => {
    const sizeClasses: Record<BentoSize, string> = {
      sm: 'col-span-1 row-span-1',
      md: 'col-span-1 md:col-span-2 row-span-1',
      lg: 'col-span-1 md:col-span-2 row-span-1 md:row-span-2',
      wide: 'col-span-1 md:col-span-3 row-span-1',
      tall: 'col-span-1 row-span-1 md:row-span-2',
      full: 'col-span-1 sm:col-span-2 md:col-span-4 row-span-1',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-4',
          'border border-border/50',
          'transition-all duration-300',
          sizeClasses[size],
          glass && 'bg-card/80 backdrop-blur-sm',
          !glass && 'bg-card',
          interactive && [
            'hover:scale-[1.02]',
            'hover:shadow-lg',
            'hover:border-border',
            'cursor-pointer',
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoItem.displayName = 'BentoItem';

// ============================================================================
// Bento Card (Pre-styled item with header/content)
// ============================================================================

interface BentoCardProps extends BentoItemProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, title, subtitle, icon, action, children, ...props }, ref) => {
    return (
      <BentoItem
        ref={ref}
        className={cn('flex flex-col', className)}
        {...props}
      >
        {/* Header */}
        {(title || icon || action) && (
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="font-semibold text-sm">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            {action}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </BentoItem>
    );
  }
);

BentoCard.displayName = 'BentoCard';

// ============================================================================
// Bento Stat (Metric display)
// ============================================================================

interface BentoStatProps extends Omit<BentoItemProps, 'children'> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
}

export const BentoStat = forwardRef<HTMLDivElement, BentoStatProps>(
  ({ className, label, value, change, icon, ...props }, ref) => {
    return (
      <BentoItem
        ref={ref}
        className={cn('flex flex-col justify-between', className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon && (
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1',
              change.type === 'increase' ? 'text-green-500' : 'text-red-500'
            )}>
              {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
      </BentoItem>
    );
  }
);

BentoStat.displayName = 'BentoStat';

export default BentoGrid;
