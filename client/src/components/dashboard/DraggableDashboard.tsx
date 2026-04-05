/**
 * Draggable Widget Dashboard
 * 
 * A customizable dashboard with drag-and-drop widget reordering.
 * Users can personalize their view by moving widgets around.
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  GripVertical,
  Plus,
  X,
  Settings,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Widget, WidgetType } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface DashboardWidget extends Widget {
  component: React.ComponentType<{ className?: string }>;
  minSize?: 'small' | 'medium' | 'large';
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[];
  onLayoutChange?: (widgets: DashboardWidget[]) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetAdd?: (widgetType: WidgetType) => void;
  isEditing?: boolean;
  className?: string;
}

// ============================================================================
// Sortable Widget Wrapper
// ============================================================================

interface SortableWidgetProps {
  widget: DashboardWidget;
  isEditing: boolean;
  onRemove?: () => void;
  onResize?: (size: Widget['size']) => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

function SortableWidget({
  widget,
  isEditing,
  onRemove,
  onResize,
  isLocked,
  onToggleLock,
}: SortableWidgetProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: !isEditing || isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeClasses: Record<Widget['size'], string> = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-1 md:row-span-2',
    full: 'col-span-1 sm:col-span-2 md:col-span-4 row-span-1',
  };

  const Component = widget.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        sizeClasses[widget.size],
        isDragging && 'z-50 opacity-50',
        isExpanded && 'fixed inset-4 z-50 !col-span-1 !row-span-1'
      )}
      {...attributes}
    >
      {/* Widget container */}
      <div className={cn(
        'h-full rounded-2xl border bg-card/80 backdrop-blur-sm',
        'transition-all duration-200',
        isEditing && !isLocked && 'ring-2 ring-primary/20 ring-dashed',
        isLocked && 'opacity-75'
      )}>
        {/* Edit mode controls */}
        {isEditing && (
          <div className={cn(
            'absolute -top-3 inset-x-0 flex items-center justify-center gap-1 z-10',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}>
            {/* Drag handle */}
            {!isLocked && (
              <button
                {...listeners}
                className="p-1.5 rounded-lg bg-card border shadow-sm cursor-grab active:cursor-grabbing hover:bg-muted"
                aria-label={t('dashboard.dragWidget')}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
            
            {/* Lock toggle */}
            <button
              onClick={onToggleLock}
              className="p-1.5 rounded-lg bg-card border shadow-sm hover:bg-muted"
              aria-label={isLocked ? t('dashboard.unlockWidget') : t('dashboard.lockWidget')}
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
            
            {/* Resize */}
            {!isLocked && (
              <button
                onClick={() => {
                  const sizes: Widget['size'][] = ['small', 'medium', 'large'];
                  const currentIndex = sizes.indexOf(widget.size);
                  const nextSize = sizes[(currentIndex + 1) % sizes.length];
                  onResize?.(nextSize);
                }}
                className="p-1.5 rounded-lg bg-card border shadow-sm hover:bg-muted"
                aria-label={t('dashboard.resizeWidget')}
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            
            {/* Remove */}
            {!isLocked && (
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 shadow-sm hover:bg-destructive/20 text-destructive"
                aria-label={t('dashboard.removeWidget')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {/* Expand/Collapse button (always visible) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'absolute top-2 end-2 p-1.5 rounded-lg z-10',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'bg-card/80 border shadow-sm hover:bg-muted'
          )}
          aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
        
        {/* Widget content */}
        <div className={cn(
          'h-full p-4',
          isEditing && 'pointer-events-none'
        )}>
          <Component className="h-full" />
        </div>
      </div>
      
      {/* Expanded overlay backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Widget Preview (for drag overlay)
// ============================================================================

interface WidgetPreviewProps {
  widget: DashboardWidget;
}

function WidgetPreview({ widget }: WidgetPreviewProps) {
  return (
    <div className={cn(
      'rounded-2xl border-2 border-primary bg-card/90 backdrop-blur-lg',
      'shadow-2xl p-4',
      'w-64 h-40'
    )}>
      <div className="h-full flex items-center justify-center">
        <span className="text-sm font-medium">{widget.title}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Widget Palette (for adding new widgets)
// ============================================================================

interface WidgetPaletteProps {
  availableWidgets: { type: WidgetType; title: string; icon: React.ReactNode }[];
  onAdd: (type: WidgetType) => void;
  className?: string;
}

function WidgetPalette({ availableWidgets, onAdd, className }: WidgetPaletteProps) {
  const { t } = useTranslation();
  
  return (
    <div className={cn(
      'p-4 rounded-2xl border bg-card/80 backdrop-blur-sm',
      className
    )}>
      <h3 className="text-sm font-medium mb-3">{t('dashboard.addWidget')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableWidgets.map(({ type, title, icon }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAdd(type)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl',
              'border border-dashed border-muted-foreground/30',
              'hover:border-primary hover:bg-primary/5',
              'transition-colors'
            )}
          >
            <div className="p-2 rounded-lg bg-muted">
              {icon}
            </div>
            <span className="text-xs text-center">{title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export { WidgetPalette };

export function DraggableDashboard({
  widgets: initialWidgets,
  onLayoutChange,
  onWidgetRemove,
  onWidgetAdd,
  isEditing: externalIsEditing,
  className,
}: DraggableDashboardProps) {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState(initialWidgets);
  const [activeWidget, setActiveWidget] = useState<DashboardWidget | null>(null);
  const [isEditing, setIsEditing] = useState(externalIsEditing ?? false);
  const [lockedWidgets, setLockedWidgets] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const widget = widgets.find(w => w.id === event.active.id);
    if (widget) {
      setActiveWidget(widget);
    }
  }, [widgets]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveWidget(null);

    if (over && active.id !== over.id) {
      setWidgets(prev => {
        const oldIndex = prev.findIndex(w => w.id === active.id);
        const newIndex = prev.findIndex(w => w.id === over.id);
        const newWidgets = arrayMove(prev, oldIndex, newIndex);
        onLayoutChange?.(newWidgets);
        return newWidgets;
      });
    }
  }, [onLayoutChange]);

  const handleRemove = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const newWidgets = prev.filter(w => w.id !== widgetId);
      onLayoutChange?.(newWidgets);
      return newWidgets;
    });
    onWidgetRemove?.(widgetId);
  }, [onLayoutChange, onWidgetRemove]);

  const handleResize = useCallback((widgetId: string, size: Widget['size']) => {
    setWidgets(prev => {
      const newWidgets = prev.map(w => 
        w.id === widgetId ? { ...w, size } : w
      );
      onLayoutChange?.(newWidgets);
      return newWidgets;
    });
  }, [onLayoutChange]);

  const toggleLock = useCallback((widgetId: string) => {
    setLockedWidgets(prev => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  }, []);

  const widgetIds = useMemo(() => widgets.map(w => w.id), [widgets]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Edit mode toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('dashboard.title')}</h2>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? t('dashboard.doneEditing') : t('dashboard.customize')}
        </Button>
      </div>

      {/* Widget grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className={cn(
            'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4',
            'auto-rows-[minmax(180px,auto)]'
          )}>
            {widgets.map(widget => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                isEditing={isEditing}
                isLocked={lockedWidgets.has(widget.id)}
                onRemove={() => handleRemove(widget.id)}
                onResize={(size) => handleResize(widget.id, size)}
                onToggleLock={() => toggleLock(widget.id)}
              />
            ))}
            
            {/* Add widget button (in edit mode) */}
            {isEditing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'col-span-1 row-span-1 min-h-[180px]',
                  'flex flex-col items-center justify-center gap-2',
                  'rounded-2xl border-2 border-dashed border-muted-foreground/30',
                  'hover:border-primary hover:bg-primary/5',
                  'transition-colors cursor-pointer'
                )}
                onClick={() => onWidgetAdd?.('tasksSummary')}
              >
                <div className="p-3 rounded-full bg-muted">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.addWidget')}
                </span>
              </motion.button>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeWidget && <WidgetPreview widget={activeWidget} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default DraggableDashboard;
