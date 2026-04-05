/**
 * Interactive Empty States
 * 
 * Engaging empty state components with animations and interactive elements
 * that guide users toward taking action.
 */

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Plus,
  Inbox,
  FolderOpen,
  Search,
  FileQuestion,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  type?: 'default' | 'tasks' | 'search' | 'board' | 'project' | 'inbox';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

// ============================================================================
// Animated Illustrations
// ============================================================================

function FloatingElements() {
  return (
    <div className="relative w-32 h-32">
      {/* Main icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="p-6 rounded-2xl bg-primary/10 text-primary">
          <FolderOpen className="h-12 w-12" />
        </div>
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-primary/30"
          initial={{
            x: 64 + Math.cos(i * Math.PI / 2) * 50,
            y: 64 + Math.sin(i * Math.PI / 2) * 50,
          }}
          animate={{
            x: [
              64 + Math.cos(i * Math.PI / 2) * 50,
              64 + Math.cos((i + 0.5) * Math.PI / 2) * 60,
              64 + Math.cos(i * Math.PI / 2) * 50,
            ],
            y: [
              64 + Math.sin(i * Math.PI / 2) * 50,
              64 + Math.sin((i + 0.5) * Math.PI / 2) * 60,
              64 + Math.sin(i * Math.PI / 2) * 50,
            ],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

function TasksIllustration() {
  return (
    <div className="relative w-40 h-32">
      {/* Stacked cards */}
      {[2, 1, 0].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'absolute left-1/2 w-32 h-20 rounded-lg border-2 border-dashed',
            i === 0 ? 'border-primary bg-primary/5' : 'border-muted bg-muted/50'
          )}
          initial={{ x: '-50%', y: i * 8 }}
          animate={{
            y: i === 0 ? [i * 8, i * 8 - 4, i * 8] : i * 8,
            rotate: i === 0 ? [0, 1, 0] : (i - 1) * 3,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {i === 0 && (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="h-2 flex-1 bg-primary/20 rounded" />
              </div>
              <div className="h-2 w-3/4 bg-primary/10 rounded" />
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Plus icon */}
      <motion.div
        className="absolute -top-2 right-0 p-2 rounded-full bg-primary text-primary-foreground"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="h-4 w-4" />
      </motion.div>
    </div>
  );
}

function SearchIllustration() {
  return (
    <div className="relative w-32 h-32">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Search className="h-16 w-16 text-muted-foreground" />
      </motion.div>
      
      {/* Sparkles */}
      <motion.div
        className="absolute top-2 right-4"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      >
        <Sparkles className="h-4 w-4 text-primary" />
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-2"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
      >
        <Sparkles className="h-3 w-3 text-primary" />
      </motion.div>
    </div>
  );
}

function BoardIllustration() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((col) => (
        <motion.div
          key={col}
          className="w-16 rounded-lg bg-muted/50 p-2 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: col * 0.1 }}
        >
          <div className="h-2 bg-muted rounded" />
          {[...Array(2 - col)].map((_, i) => (
            <motion.div
              key={i}
              className="h-8 rounded bg-card border shadow-sm"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: col * 0.3 + i * 0.2,
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const { t } = useTranslation();
  
  // Default content based on type
  const defaults: Record<string, { title: string; description: string; illustration: ReactNode }> = {
    default: {
      title: t('emptyState.default.title'),
      description: t('emptyState.default.description'),
      illustration: <FloatingElements />,
    },
    tasks: {
      title: t('emptyState.tasks.title'),
      description: t('emptyState.tasks.description'),
      illustration: <TasksIllustration />,
    },
    search: {
      title: t('emptyState.search.title'),
      description: t('emptyState.search.description'),
      illustration: <SearchIllustration />,
    },
    board: {
      title: t('emptyState.board.title'),
      description: t('emptyState.board.description'),
      illustration: <BoardIllustration />,
    },
    project: {
      title: t('emptyState.project.title'),
      description: t('emptyState.project.description'),
      illustration: <FloatingElements />,
    },
    inbox: {
      title: t('emptyState.inbox.title'),
      description: t('emptyState.inbox.description'),
      illustration: (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Inbox className="h-16 w-16 text-muted-foreground" />
        </motion.div>
      ),
    },
  };
  
  const content = defaults[type] || defaults.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        'empty-state-gradient rounded-2xl',
        className
      )}
    >
      {/* Illustration */}
      <div className="mb-6">
        {children || content.illustration}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">
        {title || content.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || content.description}
      </p>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        {action && (
          <Button onClick={action.onClick}>
            <Zap className="h-4 w-4 me-2" />
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
            <ArrowRight className="h-4 w-4 ms-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Compact Empty State
// ============================================================================

interface CompactEmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function CompactEmptyState({
  icon,
  message,
  action,
  className,
}: CompactEmptyStateProps) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-3 py-8 px-4',
      'text-muted-foreground',
      className
    )}>
      {icon || <FileQuestion className="h-5 w-5" />}
      <span className="text-sm">{message}</span>
      {action && (
        <Button variant="link" size="sm" onClick={action.onClick} className="p-0">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
