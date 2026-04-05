/**
 * Real-Time Presence Indicators
 * 
 * Shows who's online and what they're currently viewing/editing:
 * - User avatars with online status
 * - Live cursors on collaborative views
 * - "Currently viewing" indicators
 * - Typing indicators
 * - Activity status (idle, active, away)
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Circle,
  Eye,
  Edit3,
  Clock,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type PresenceStatus = 'online' | 'idle' | 'away' | 'dnd' | 'offline';

export interface UserPresence {
  userId: string;
  name: string;
  avatar?: string;
  status: PresenceStatus;
  currentView?: string;
  currentTask?: string;
  isTyping?: boolean;
  lastSeen: Date;
  cursorPosition?: { x: number; y: number };
  color: string;
}

interface PresenceContextType {
  presences: UserPresence[];
  currentUserId: string;
  updatePresence: (updates: Partial<UserPresence>) => void;
  getPresenceForView: (viewId: string) => UserPresence[];
  getPresenceForTask: (taskId: string) => UserPresence[];
}

// ============================================================================
// Mock Data & Simulation
// ============================================================================

const USER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const MOCK_USERS: UserPresence[] = [
  {
    userId: 'user-1',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'online',
    currentView: 'kanban',
    lastSeen: new Date(),
    color: USER_COLORS[0],
  },
  {
    userId: 'user-2',
    name: 'Ahmed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    status: 'online',
    currentView: 'kanban',
    currentTask: 'task-1',
    isTyping: true,
    lastSeen: new Date(),
    color: USER_COLORS[1],
  },
  {
    userId: 'user-3',
    name: 'Marie Dupont',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    status: 'idle',
    currentView: 'dashboard',
    lastSeen: new Date(Date.now() - 300000),
    color: USER_COLORS[2],
  },
  {
    userId: 'user-4',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'away',
    lastSeen: new Date(Date.now() - 1800000),
    color: USER_COLORS[3],
  },
  {
    userId: 'user-5',
    name: 'Lisa Wong',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    status: 'dnd',
    currentView: 'gantt',
    lastSeen: new Date(),
    color: USER_COLORS[4],
  },
];

// ============================================================================
// Context
// ============================================================================

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [presences, setPresences] = useState<UserPresence[]>(MOCK_USERS);
  const currentUserId = 'user-current';
  
  // Simulate real-time presence updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPresences(prev => prev.map(p => {
        // Randomly update some presences
        if (Math.random() > 0.7) {
          const statuses: PresenceStatus[] = ['online', 'idle', 'away'];
          return {
            ...p,
            status: p.status === 'dnd' ? 'dnd' : statuses[Math.floor(Math.random() * statuses.length)],
            isTyping: Math.random() > 0.8,
            lastSeen: p.status === 'online' ? new Date() : p.lastSeen,
          };
        }
        return p;
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updatePresence = useCallback((updates: Partial<UserPresence>) => {
    setPresences(prev => prev.map(p => 
      p.userId === currentUserId ? { ...p, ...updates, lastSeen: new Date() } : p
    ));
  }, [currentUserId]);
  
  const getPresenceForView = useCallback((viewId: string) => {
    return presences.filter(p => p.currentView === viewId && p.status !== 'offline');
  }, [presences]);
  
  const getPresenceForTask = useCallback((taskId: string) => {
    return presences.filter(p => p.currentTask === taskId && p.status !== 'offline');
  }, [presences]);
  
  return (
    <PresenceContext.Provider value={{
      presences,
      currentUserId,
      updatePresence,
      getPresenceForView,
      getPresenceForTask,
    }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}

// ============================================================================
// Status Colors & Labels
// ============================================================================

const STATUS_CONFIG: Record<PresenceStatus, { color: string; bgColor: string; label: string }> = {
  online: { color: '#22c55e', bgColor: 'bg-green-500', label: 'presence.online' },
  idle: { color: '#f59e0b', bgColor: 'bg-amber-500', label: 'presence.idle' },
  away: { color: '#94a3b8', bgColor: 'bg-slate-400', label: 'presence.away' },
  dnd: { color: '#ef4444', bgColor: 'bg-red-500', label: 'presence.dnd' },
  offline: { color: '#64748b', bgColor: 'bg-slate-500', label: 'presence.offline' },
};

// ============================================================================
// Presence Avatar Component
// ============================================================================

interface PresenceAvatarProps {
  user: UserPresence;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function PresenceAvatar({
  user,
  size = 'md',
  showStatus = true,
  showTooltip = true,
  className,
}: PresenceAvatarProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const statusSizeClasses = {
    xs: 'w-2 h-2 bottom-0 end-0',
    sm: 'w-2.5 h-2.5 bottom-0 end-0',
    md: 'w-3 h-3 bottom-0 end-0',
    lg: 'w-3.5 h-3.5 bottom-0.5 end-0.5',
  };
  
  const statusConfig = STATUS_CONFIG[user.status];
  
  return (
    <div 
      className={cn('relative', className)}
      onMouseEnter={() => showTooltip && setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Avatar */}
      <div className={cn(
        'rounded-full overflow-hidden ring-2 ring-background',
        sizeClasses[size]
      )}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      {showStatus && (
        <span className={cn(
          'absolute rounded-full ring-2 ring-background',
          statusSizeClasses[size],
          statusConfig.bgColor,
          user.status === 'online' && 'animate-pulse'
        )} />
      )}
      
      {/* Typing indicator */}
      {user.isTyping && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -end-1 p-1 rounded-full bg-primary text-primary-foreground"
        >
          <Edit3 className="w-2.5 h-2.5" />
        </motion.div>
      )}
      
      {/* Tooltip */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className={cn(
              'absolute z-50 bottom-full mb-2 start-1/2 -translate-x-1/2',
              'px-3 py-2 rounded-xl',
              'bg-popover border shadow-xl',
              'text-sm whitespace-nowrap'
            )}
          >
            <div className="font-medium">{user.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Circle 
                className="w-2 h-2" 
                fill={statusConfig.color} 
                stroke={statusConfig.color} 
              />
              <span>{t(statusConfig.label)}</span>
              {user.currentView && (
                <>
                  <span>•</span>
                  <Eye className="w-3 h-3" />
                  <span>{user.currentView}</span>
                </>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute top-full start-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Presence Stack (Multiple Avatars)
// ============================================================================

interface PresenceStackProps {
  users: UserPresence[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function PresenceStack({ users, max = 4, size = 'sm', className }: PresenceStackProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  const overlapClasses = {
    xs: '-ms-2',
    sm: '-ms-2.5',
    md: '-ms-3',
  };
  
  return (
    <div className={cn('flex items-center', className)}>
      {visibleUsers.map((user, index) => (
        <div
          key={user.userId}
          className={cn(index > 0 && overlapClasses[size])}
          style={{ zIndex: users.length - index }}
        >
          <PresenceAvatar user={user} size={size} />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className={cn(
          overlapClasses[size],
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background',
          size === 'xs' && 'w-6 h-6',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10'
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Presence List (Sidebar View)
// ============================================================================

interface PresenceListProps {
  className?: string;
  showOffline?: boolean;
}

export function PresenceList({ className, showOffline = false }: PresenceListProps) {
  const { t } = useTranslation();
  const { presences } = usePresence();
  
  const filteredPresences = showOffline 
    ? presences 
    : presences.filter(p => p.status !== 'offline');
  
  const groupedPresences = {
    online: filteredPresences.filter(p => p.status === 'online'),
    idle: filteredPresences.filter(p => p.status === 'idle'),
    away: filteredPresences.filter(p => p.status === 'away'),
    dnd: filteredPresences.filter(p => p.status === 'dnd'),
    offline: showOffline ? filteredPresences.filter(p => p.status === 'offline') : [],
  };
  
  const formatLastSeen = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return t('presence.justNow');
    if (minutes < 60) return t('presence.minutesAgo', { count: minutes });
    if (hours < 24) return t('presence.hoursAgo', { count: hours });
    return t('presence.daysAgo', { count: Math.floor(hours / 24) });
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {Object.entries(groupedPresences).map(([status, users]) => {
        if (users.length === 0) return null;
        
        const config = STATUS_CONFIG[status as PresenceStatus];
        
        return (
          <div key={status}>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Circle 
                className="w-2 h-2" 
                fill={config.color} 
                stroke={config.color} 
              />
              <span>{t(config.label)}</span>
              <span className="text-muted-foreground/50">({users.length})</span>
            </div>
            
            <div className="space-y-1">
              {users.map(user => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 px-2 py-2 rounded-xl',
                    'hover:bg-muted transition-colors cursor-pointer'
                  )}
                >
                  <PresenceAvatar user={user} size="sm" showTooltip={false} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {user.isTyping ? (
                        <>
                          <MessageCircle className="w-3 h-3" />
                          <span>{t('presence.typing')}</span>
                          <TypingDots />
                        </>
                      ) : user.currentView ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>{t(`views.${user.currentView}`)}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{formatLastSeen(user.lastSeen)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Typing Dots Animation
// ============================================================================

function TypingDots() {
  return (
    <span className="flex gap-0.5 ms-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

// ============================================================================
// Live Cursor Component
// ============================================================================

interface LiveCursorProps {
  user: UserPresence;
  className?: string;
}

export function LiveCursor({ user, className }: LiveCursorProps) {
  if (!user.cursorPosition) return null;
  
  return (
    <motion.div
      className={cn('fixed pointer-events-none z-50', className)}
      animate={{
        x: user.cursorPosition.x,
        y: user.cursorPosition.y,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
    >
      {/* Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-lg"
      >
        <path
          d="M5.65376 12.456H5.46026L5.31717 12.5765L2.17812 15.2551L2.08078 14.9659L6.22896 2.22314L17.8193 13.8135L5.65376 12.456Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Name tag */}
      <div
        className="absolute top-5 start-4 px-2 py-0.5 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name.split(' ')[0]}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Task Viewers Indicator
// ============================================================================

interface TaskViewersProps {
  taskId: string;
  className?: string;
}

export function TaskViewers({ taskId, className }: TaskViewersProps) {
  const { t } = useTranslation();
  const { getPresenceForTask } = usePresence();
  const viewers = getPresenceForTask(taskId);
  
  if (viewers.length === 0) return null;
  
  const typingUsers = viewers.filter(v => v.isTyping);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <PresenceStack users={viewers} max={3} size="xs" />
      
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Edit3 className="w-3 h-3" />
          <span>
            {typingUsers.length === 1
              ? t('presence.userTyping', { name: typingUsers[0].name.split(' ')[0] })
              : t('presence.multipleTyping', { count: typingUsers.length })}
          </span>
          <TypingDots />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// View Presence Bar
// ============================================================================

interface ViewPresenceBarProps {
  viewId: string;
  className?: string;
}

export function ViewPresenceBar({ viewId, className }: ViewPresenceBarProps) {
  const { t } = useTranslation();
  const { getPresenceForView } = usePresence();
  const viewers = getPresenceForView(viewId);
  
  if (viewers.length === 0) return null;
  
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 rounded-xl',
      'bg-muted/50 border',
      className
    )}>
      <PresenceStack users={viewers} max={5} size="sm" />
      
      <div className="text-sm text-muted-foreground">
        {viewers.length === 1
          ? t('presence.viewingAlone', { name: viewers[0].name.split(' ')[0] })
          : t('presence.viewingWith', { count: viewers.length })}
      </div>
      
      <button className="ms-auto p-1.5 rounded-lg hover:bg-muted transition-colors">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export default PresenceList;
