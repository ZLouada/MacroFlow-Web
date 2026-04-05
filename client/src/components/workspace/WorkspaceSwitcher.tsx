/**
 * Multi-Workspace Switcher
 * 
 * Advanced workspace management with:
 * - Quick switching between workspaces
 * - Workspace-specific settings and themes
 * - Recent activity per workspace
 * - Workspace favorites
 * - Create/join workspace modal
 */

import { useState, useCallback, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Star,
  StarOff,
  Users,
  ChevronDown,
  Check,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ============================================================================
// Types
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color: string;
  memberCount: number;
  projectCount: number;
  isPersonal: boolean;
  isPremium: boolean;
  isPrivate: boolean;
  role: 'owner' | 'admin' | 'member' | 'guest';
  lastAccessedAt: Date;
  createdAt: Date;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  favorites: string[];
  recentWorkspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  toggleFavorite: (workspaceId: string) => void;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'MacroFlow Team',
    slug: 'macroflow',
    icon: '🚀',
    color: '#6366f1',
    memberCount: 12,
    projectCount: 8,
    isPersonal: false,
    isPremium: true,
    isPrivate: false,
    role: 'owner',
    lastAccessedAt: new Date(),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'ws-2',
    name: 'Personal',
    slug: 'personal',
    icon: '👤',
    color: '#10b981',
    memberCount: 1,
    projectCount: 3,
    isPersonal: true,
    isPremium: false,
    isPrivate: true,
    role: 'owner',
    lastAccessedAt: new Date(Date.now() - 86400000),
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'ws-3',
    name: 'Acme Corp',
    slug: 'acme',
    icon: '🏢',
    color: '#f59e0b',
    memberCount: 45,
    projectCount: 23,
    isPersonal: false,
    isPremium: true,
    isPrivate: false,
    role: 'admin',
    lastAccessedAt: new Date(Date.now() - 172800000),
    createdAt: new Date('2023-11-20'),
  },
  {
    id: 'ws-4',
    name: 'Freelance',
    slug: 'freelance',
    icon: '💼',
    color: '#ec4899',
    memberCount: 1,
    projectCount: 5,
    isPersonal: true,
    isPremium: false,
    isPrivate: true,
    role: 'owner',
    lastAccessedAt: new Date(Date.now() - 604800000),
    createdAt: new Date('2024-03-10'),
  },
];

// ============================================================================
// Context
// ============================================================================

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('ws-1');
  const [favorites, setFavorites] = useState<string[]>(['ws-1']);
  
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || null;
  
  const recentWorkspaces = [...workspaces]
    .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
    .slice(0, 3);
  
  const switchWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId 
        ? { ...w, lastAccessedAt: new Date() }
        : w
    ));
  }, []);
  
  const toggleFavorite = useCallback((workspaceId: string) => {
    setFavorites(prev => 
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    );
  }, []);
  
  const createWorkspace = useCallback(async (data: Partial<Workspace>): Promise<Workspace> => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name || 'New Workspace',
      slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'new-workspace',
      icon: data.icon || '📁',
      color: data.color || '#6366f1',
      memberCount: 1,
      projectCount: 0,
      isPersonal: data.isPersonal ?? false,
      isPremium: false,
      isPrivate: data.isPrivate ?? true,
      role: 'owner',
      lastAccessedAt: new Date(),
      createdAt: new Date(),
    };
    
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  }, []);
  
  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === id ? { ...w, ...data } : w
    ));
  }, []);
  
  const deleteWorkspace = useCallback(async (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    if (currentWorkspaceId === id) {
      setCurrentWorkspaceId(workspaces[0]?.id || '');
    }
  }, [currentWorkspaceId, workspaces]);
  
  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      currentWorkspace,
      favorites,
      recentWorkspaces,
      switchWorkspace,
      toggleFavorite,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

// ============================================================================
// Workspace Avatar Component
// ============================================================================

interface WorkspaceAvatarProps {
  workspace: Workspace;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export function WorkspaceAvatar({ workspace, size = 'md', showBadge = false }: WorkspaceAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  };
  
  return (
    <div className="relative">
      <div
        className={cn(
          'rounded-xl flex items-center justify-center font-medium',
          sizeClasses[size]
        )}
        style={{ backgroundColor: workspace.color + '20', color: workspace.color }}
      >
        {workspace.icon || workspace.name.charAt(0).toUpperCase()}
      </div>
      {showBadge && workspace.isPremium && (
        <div className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Workspace Switcher Component
// ============================================================================

interface WorkspaceSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function WorkspaceSwitcher({ className, compact = false }: WorkspaceSwitcherProps) {
  const { t } = useTranslation();
  const {
    workspaces,
    currentWorkspace,
    favorites,
    recentWorkspaces,
    switchWorkspace,
    toggleFavorite,
  } = useWorkspace();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const favoriteWorkspaces = filteredWorkspaces.filter(ws => favorites.includes(ws.id));
  const otherWorkspaces = filteredWorkspaces.filter(ws => !favorites.includes(ws.id));
  
  if (!currentWorkspace) return null;
  
  return (
    <div className={cn('relative', className)}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
          'hover:bg-muted',
          compact && 'p-2'
        )}
      >
        <WorkspaceAvatar workspace={currentWorkspace} size="sm" showBadge />
        {!compact && (
          <>
            <div className="text-start">
              <div className="font-medium text-sm">{currentWorkspace.name}</div>
              <div className="text-xs text-muted-foreground">
                {currentWorkspace.memberCount} {t('workspace.members')}
              </div>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )} />
          </>
        )}
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full mt-2 z-50',
                'w-80 max-h-[70vh] overflow-hidden rounded-2xl',
                'glass border shadow-2xl',
                'flex flex-col',
                'start-0'
              )}
            >
              {/* Search */}
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('workspace.searchPlaceholder')}
                    className={cn(
                      'w-full ps-9 pe-3 py-2 rounded-xl bg-muted/50 border-0',
                      'text-sm placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20'
                    )}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Workspace lists */}
              <div className="flex-1 overflow-y-auto p-2">
                {/* Favorites */}
                {favoriteWorkspaces.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {t('workspace.favorites')}
                    </div>
                    {favoriteWorkspaces.map(ws => (
                      <WorkspaceItem
                        key={ws.id}
                        workspace={ws}
                        isActive={ws.id === currentWorkspace.id}
                        isFavorite={true}
                        onSelect={() => {
                          switchWorkspace(ws.id);
                          setIsOpen(false);
                        }}
                        onToggleFavorite={() => toggleFavorite(ws.id)}
                      />
                    ))}
                  </div>
                )}
                
                {/* Recent */}
                {searchQuery === '' && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('workspace.recent')}
                    </div>
                    {recentWorkspaces.filter(ws => !favorites.includes(ws.id)).slice(0, 2).map(ws => (
                      <WorkspaceItem
                        key={ws.id}
                        workspace={ws}
                        isActive={ws.id === currentWorkspace.id}
                        isFavorite={favorites.includes(ws.id)}
                        onSelect={() => {
                          switchWorkspace(ws.id);
                          setIsOpen(false);
                        }}
                        onToggleFavorite={() => toggleFavorite(ws.id)}
                      />
                    ))}
                  </div>
                )}
                
                {/* All workspaces */}
                {otherWorkspaces.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {t('workspace.allWorkspaces')}
                    </div>
                    {otherWorkspaces.map(ws => (
                      <WorkspaceItem
                        key={ws.id}
                        workspace={ws}
                        isActive={ws.id === currentWorkspace.id}
                        isFavorite={favorites.includes(ws.id)}
                        onSelect={() => {
                          switchWorkspace(ws.id);
                          setIsOpen(false);
                        }}
                        onToggleFavorite={() => toggleFavorite(ws.id)}
                      />
                    ))}
                  </div>
                )}
                
                {filteredWorkspaces.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t('workspace.noResults')}
                  </div>
                )}
              </div>
              
              {/* Footer actions */}
              <div className="p-2 border-t bg-muted/30">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl',
                    'text-sm font-medium',
                    'hover:bg-primary/10 text-primary transition-colors'
                  )}
                >
                  <Plus className="h-4 w-4" />
                  {t('workspace.createNew')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

// ============================================================================
// Workspace Item Component
// ============================================================================

interface WorkspaceItemProps {
  workspace: Workspace;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function WorkspaceItem({
  workspace,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: WorkspaceItemProps) {
  const { t } = useTranslation();
  
  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer',
        'transition-colors',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
      onClick={onSelect}
    >
      <WorkspaceAvatar workspace={workspace} size="sm" showBadge />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{workspace.name}</span>
          {workspace.isPrivate && (
            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          {!workspace.isPrivate && (
            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {workspace.memberCount}
          </span>
          <span>•</span>
          <span>{workspace.projectCount} {t('workspace.projects')}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            'opacity-0 group-hover:opacity-100',
            isFavorite ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {isFavorite ? (
            <Star className="h-4 w-4 fill-current" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>
        
        {isActive && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Create Workspace Modal
// ============================================================================

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { t } = useTranslation();
  const { createWorkspace, switchWorkspace } = useWorkspace();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#6366f1');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  ];
  
  const icons = ['📁', '🚀', '💼', '🎯', '⭐', '🔮', '🌟', '💎'];
  
  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        icon,
        color,
        isPrivate,
      });
      switchWorkspace(workspace.id);
      onClose();
      setName('');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-md p-6 rounded-2xl',
              'bg-card border shadow-2xl'
            )}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('workspace.createTitle')}
            </h2>
            
            {/* Preview */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: color + '20', color }}
              >
                {icon}
              </div>
              <div>
                <div className="font-medium">{name || t('workspace.newWorkspace')}</div>
                <div className="text-sm text-muted-foreground">
                  {isPrivate ? t('workspace.private') : t('workspace.public')}
                </div>
              </div>
            </div>
            
            {/* Name input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {t('workspace.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('workspace.namePlaceholder')}
                className={cn(
                  'w-full px-4 py-2 rounded-xl bg-muted/50 border',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}
                autoFocus
              />
            </div>
            
            {/* Icon selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {t('workspace.icon')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(i => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-lg',
                      'transition-all',
                      icon === i
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {t('workspace.color')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === c && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            
            {/* Privacy toggle */}
            <div className="mb-6">
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl',
                  'bg-muted/50 hover:bg-muted transition-colors'
                )}
              >
                <span className="flex items-center gap-2 text-sm">
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {isPrivate ? t('workspace.private') : t('workspace.public')}
                </span>
                <div className={cn(
                  'w-10 h-6 rounded-full transition-colors relative',
                  isPrivate ? 'bg-primary' : 'bg-muted'
                )}>
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
                    isPrivate ? 'left-5' : 'left-1'
                  )} />
                </div>
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isLoading}
                className="flex-1 gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {t('workspace.create')}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WorkspaceSwitcher;
