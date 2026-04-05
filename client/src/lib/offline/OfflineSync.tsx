/**
 * Offline-First Sync with IndexedDB
 * 
 * Provides:
 * - Local-first data storage with IndexedDB
 * - Background sync when online
 * - Conflict resolution
 * - Optimistic updates
 * - Sync status indicators
 * - Queue management for offline changes
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertTriangle,
  Upload,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'project' | 'comment';
  entityId: string;
  data: unknown;
  timestamp: number;
  retries: number;
  error?: string;
}

export interface SyncState {
  status: SyncStatus;
  isOnline: boolean;
  lastSyncedAt: Date | null;
  pendingChanges: number;
  queuedItems: SyncQueueItem[];
  conflicts: ConflictItem[];
}

export interface ConflictItem {
  id: string;
  entity: 'task' | 'project' | 'comment';
  entityId: string;
  localVersion: unknown;
  serverVersion: unknown;
  timestamp: number;
}

interface OfflineSyncContextType {
  state: SyncState;
  sync: () => Promise<void>;
  queueChange: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => void;
  resolveConflict: (conflictId: string, resolution: 'local' | 'server') => void;
  clearQueue: () => void;
  getFromCache: <T>(key: string) => Promise<T | null>;
  setToCache: <T>(key: string, value: T) => Promise<void>;
}

// ============================================================================
// IndexedDB Setup
// ============================================================================

const DB_NAME = 'macroflow-offline';
const DB_VERSION = 1;

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('status', 'status');
        taskStore.createIndex('projectId', 'projectId');
        taskStore.createIndex('updatedAt', 'updatedAt');
      }
      
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        queueStore.createIndex('timestamp', 'timestamp');
      }
      
      if (!db.objectStoreNames.contains('cache')) {
        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
        cacheStore.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// ============================================================================
// IndexedDB Operations
// ============================================================================

async function dbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? []);
  });
}

async function dbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function dbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function dbClear(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Context
// ============================================================================

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    status: 'synced',
    isOnline: navigator.onLine,
    lastSyncedAt: null,
    pendingChanges: 0,
    queuedItems: [],
    conflicts: [],
  });
  
  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMountedRef = useRef(true);
  
  // Ref to hold the latest sync function for use in event handlers
  const syncRef = useRef<() => Promise<void>>();
  
  const loadQueue = useCallback(async () => {
    try {
      const items = await dbGetAll<SyncQueueItem>('syncQueue');
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          queuedItems: items,
          pendingChanges: items.length,
          status: items.length > 0 ? 'pending' : 'synced',
        }));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }, []);
  
  const sync = useCallback(async () => {
    if (!navigator.onLine) {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, status: 'offline' }));
      }
      return;
    }
    
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, status: 'syncing' }));
    }
    
    try {
      const items = await dbGetAll<SyncQueueItem>('syncQueue');
      
      // Process queue items
      for (const item of items) {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Remove from queue on success
          await dbDelete('syncQueue', item.id);
        } catch (error) {
          // Update retry count
          await dbPut('syncQueue', {
            ...item,
            retries: item.retries + 1,
            error: String(error),
          });
        }
      }
      
      // Reload queue
      await loadQueue();
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          status: 'synced',
          lastSyncedAt: new Date(),
        }));
      }
    } catch {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          status: 'error',
        }));
      }
    }
  }, [loadQueue]);
  
  // Keep syncRef updated with latest sync function
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isOnline: true }));
      }
      // Auto-sync when back online using ref to avoid stale closure
      syncRef.current?.();
    };
    
    const handleOffline = () => {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isOnline: false, status: 'offline' }));
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load queue from IndexedDB on mount
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);
  
  const queueChange = useCallback(async (
    item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>
  ) => {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    
    await dbPut('syncQueue', queueItem);
    
    setState(prev => ({
      ...prev,
      queuedItems: [...prev.queuedItems, queueItem],
      pendingChanges: prev.pendingChanges + 1,
      status: 'pending',
    }));
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      sync();
    }
  }, [sync]);
  
  const resolveConflict = useCallback((conflictId: string, resolution: 'local' | 'server') => {
    setState(prev => ({
      ...prev,
      conflicts: prev.conflicts.filter(c => c.id !== conflictId),
    }));
    
    // In a real app, apply the resolution
    console.log(`Conflict ${conflictId} resolved with ${resolution} version`);
  }, []);
  
  const clearQueue = useCallback(async () => {
    await dbClear('syncQueue');
    setState(prev => ({
      ...prev,
      queuedItems: [],
      pendingChanges: 0,
      status: 'synced',
    }));
  }, []);
  
  const getFromCache = useCallback(async <T,>(key: string): Promise<T | null> => {
    try {
      const item = await dbGet<{ key: string; value: T; timestamp: number }>('cache', key);
      return item?.value ?? null;
    } catch {
      return null;
    }
  }, []);
  
  const setToCache = useCallback(async <T,>(key: string, value: T): Promise<void> => {
    await dbPut('cache', { key, value, timestamp: Date.now() });
  }, []);
  
  return (
    <OfflineSyncContext.Provider value={{
      state,
      sync,
      queueChange,
      resolveConflict,
      clearQueue,
      getFromCache,
      setToCache,
    }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
}

// ============================================================================
// Sync Status Badge Component
// ============================================================================

interface SyncStatusBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncStatusBadge({ className, showLabel = true }: SyncStatusBadgeProps) {
  const { t } = useTranslation();
  const { state, sync } = useOfflineSync();
  
  const statusConfig: Record<SyncStatus, {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    label: string;
  }> = {
    synced: {
      icon: <Check className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: t('sync.synced'),
    },
    syncing: {
      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: t('sync.syncing'),
    },
    pending: {
      icon: <Upload className="w-4 h-4" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      label: t('sync.pending', { count: state.pendingChanges }),
    },
    error: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: t('sync.error'),
    },
    offline: {
      icon: <CloudOff className="w-4 h-4" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      label: t('sync.offline'),
    },
  };
  
  const config = statusConfig[state.status];
  
  return (
    <button
      onClick={() => state.status !== 'syncing' && sync()}
      disabled={state.status === 'syncing' || state.status === 'offline'}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all',
        config.bgColor,
        config.color,
        state.status !== 'syncing' && state.status !== 'offline' && 'hover:opacity-80 cursor-pointer',
        className
      )}
    >
      {config.icon}
      {showLabel && (
        <span className="text-sm font-medium">{config.label}</span>
      )}
    </button>
  );
}

// ============================================================================
// Online Status Indicator
// ============================================================================

interface OnlineStatusProps {
  className?: string;
}

export function OnlineStatus({ className }: OnlineStatusProps) {
  const { t } = useTranslation();
  const { state } = useOfflineSync();
  
  return (
    <div className={cn(
      'flex items-center gap-2 text-sm',
      state.isOnline ? 'text-green-600' : 'text-slate-500',
      className
    )}>
      {state.isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>{t('sync.online')}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>{t('sync.offline')}</span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Sync Panel Component
// ============================================================================

interface SyncPanelProps {
  className?: string;
}

export function SyncPanel({ className }: SyncPanelProps) {
  const { t } = useTranslation();
  const { state, sync, clearQueue, resolveConflict } = useOfflineSync();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTime = (date: Date | null) => {
    if (!date) return t('sync.never');
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={cn(
      'rounded-2xl border bg-card overflow-hidden',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-xl',
            state.isOnline ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
          )}>
            {state.isOnline ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
          </div>
          <div className="text-start">
            <div className="font-medium">{t('sync.title')}</div>
            <div className="text-sm text-muted-foreground">
              {t('sync.lastSync')}: {formatTime(state.lastSyncedAt)}
            </div>
          </div>
        </div>
        
        <SyncStatusBadge showLabel={false} />
      </button>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
          >
            <div className="p-4 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold">{state.pendingChanges}</div>
                  <div className="text-xs text-muted-foreground">{t('sync.pendingChanges')}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold">{state.conflicts.length}</div>
                  <div className="text-xs text-muted-foreground">{t('sync.conflicts')}</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold">
                    {state.queuedItems.filter(i => i.retries > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">{t('sync.retries')}</div>
                </div>
              </div>
              
              {/* Queue items */}
              {state.queuedItems.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">{t('sync.queuedChanges')}</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {state.queuedItems.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                      >
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          item.type === 'create' && 'bg-green-100 text-green-700',
                          item.type === 'update' && 'bg-blue-100 text-blue-700',
                          item.type === 'delete' && 'bg-red-100 text-red-700'
                        )}>
                          {item.type}
                        </span>
                        <span className="truncate flex-1">{item.entity} - {item.entityId}</span>
                        {item.retries > 0 && (
                          <span className="text-xs text-amber-600">
                            {item.retries} {t('sync.retries')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Conflicts */}
              {state.conflicts.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 text-amber-600">
                    {t('sync.conflictsFound')}
                  </div>
                  <div className="space-y-2">
                    {state.conflicts.map(conflict => (
                      <div
                        key={conflict.id}
                        className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                      >
                        <div className="text-sm font-medium mb-2">
                          {conflict.entity} - {conflict.entityId}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => resolveConflict(conflict.id, 'local')}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            {t('sync.keepLocal')}
                          </button>
                          <button
                            onClick={() => resolveConflict(conflict.id, 'server')}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            {t('sync.keepServer')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => sync()}
                  disabled={state.status === 'syncing' || !state.isOnline}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl',
                    'bg-primary text-primary-foreground font-medium',
                    'hover:bg-primary/90 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {state.status === 'syncing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t('sync.syncNow')}
                </button>
                
                {state.pendingChanges > 0 && (
                  <button
                    onClick={clearQueue}
                    className="px-4 py-2 rounded-xl border hover:bg-muted transition-colors"
                  >
                    {t('sync.clearQueue')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Offline Banner Component
// ============================================================================

export function OfflineBanner() {
  const { t } = useTranslation();
  const { state } = useOfflineSync();
  
  if (state.isOnline) return null;
  
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={cn(
        'fixed top-0 inset-x-0 z-50',
        'flex items-center justify-center gap-2 py-2',
        'bg-amber-500 text-white text-sm font-medium'
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span>{t('sync.offlineBanner')}</span>
      <span className="opacity-75">•</span>
      <span>{t('sync.changesWillSync')}</span>
    </motion.div>
  );
}

export default SyncPanel;
