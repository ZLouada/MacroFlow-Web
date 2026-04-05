/**
 * Command Bar Component (Cmd+K / Ctrl+K)
 * 
 * A floating command palette that appears globally when pressing Ctrl+K or Cmd+K.
 * Features AI-powered command parsing, quick navigation, and smart suggestions.
 * Inspired by ClickUp's clean, modern design.
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  Kanban,
  GanttChart,
  Settings,
  Plus,
  Move,
  User,
  Bell,
  Mic,
  MicOff,
  X,
  Hash,
  FileText,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  parseNaturalLanguageCommand,
  getCommandSuggestions,
  type AICommand,
} from '@/lib/ai';

// ============================================================================
// Types
// ============================================================================

interface CommandBarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface CommandBarProps {
  onCommand?: (command: AICommand) => Promise<void>;
}

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'action' | 'search';
}

type CommandState = 'idle' | 'processing' | 'success' | 'error';

// ============================================================================
// Context
// ============================================================================

const CommandBarContext = createContext<CommandBarContextType | null>(null);

export function useCommandBar() {
  const context = useContext(CommandBarContext);
  if (!context) {
    throw new Error('useCommandBar must be used within CommandBarProvider');
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

export function CommandBarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [toggle]);

  return (
    <CommandBarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CommandBarContext.Provider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CommandBar({ onCommand }: CommandBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, close } = useCommandBar();
  const [input, setInput] = useState('');
  const [commandState, setCommandState] = useState<CommandState>('idle');
  const [parsedCommand, setParsedCommand] = useState<AICommand | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs for cleanup
  const isMountedRef = useRef(true);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  // Quick navigation actions
  const quickActions: QuickAction[] = [
    {
      id: 'nav-dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      description: t('commandBar.goToDashboard'),
      action: () => { navigate('/dashboard'); close(); },
      keywords: ['dashboard', 'home', 'overview', 'main'],
      category: 'navigation',
    },
    {
      id: 'nav-kanban',
      icon: Kanban,
      label: t('nav.kanban'),
      description: t('commandBar.goToKanban'),
      action: () => { navigate('/kanban'); close(); },
      keywords: ['kanban', 'board', 'tasks', 'columns'],
      category: 'navigation',
    },
    {
      id: 'nav-gantt',
      icon: GanttChart,
      label: t('nav.gantt'),
      description: t('commandBar.goToGantt'),
      action: () => { navigate('/gantt'); close(); },
      keywords: ['gantt', 'timeline', 'schedule', 'chart'],
      category: 'navigation',
    },
    {
      id: 'nav-settings',
      icon: Settings,
      label: t('nav.settings'),
      description: t('commandBar.goToSettings'),
      action: () => { navigate('/settings'); close(); },
      keywords: ['settings', 'preferences', 'config', 'options'],
      category: 'navigation',
    },
    {
      id: 'create-task',
      icon: Plus,
      label: t('tasks.newTask'),
      description: t('commandBar.createNewTask'),
      action: () => { close(); },
      keywords: ['create', 'new', 'task', 'add', 'todo'],
      category: 'action',
    },
    {
      id: 'search-projects',
      icon: Hash,
      label: 'Search Projects',
      description: 'Find projects by name',
      action: () => { close(); },
      keywords: ['project', 'projects', 'search', 'find'],
      category: 'search',
    },
    {
      id: 'search-docs',
      icon: FileText,
      label: 'Search Documents',
      description: 'Find documents and files',
      action: () => { close(); },
      keywords: ['doc', 'docs', 'document', 'file', 'files'],
      category: 'search',
    },
    {
      id: 'search-people',
      icon: Users,
      label: 'Search People',
      description: 'Find team members',
      action: () => { close(); },
      keywords: ['people', 'team', 'member', 'user', 'users'],
      category: 'search',
    },
    {
      id: 'view-calendar',
      icon: Calendar,
      label: 'Calendar',
      description: 'View your calendar',
      action: () => { close(); },
      keywords: ['calendar', 'schedule', 'events', 'meetings'],
      category: 'navigation',
    },
  ];

  // Filter actions based on input
  const filteredActions = input.trim()
    ? quickActions.filter(action =>
        action.keywords.some(kw => kw.includes(input.toLowerCase())) ||
        action.label.toLowerCase().includes(input.toLowerCase())
      )
    : quickActions;

  // Group actions by category
  const groupedActions = {
    navigation: filteredActions.filter(a => a.category === 'navigation'),
    action: filteredActions.filter(a => a.category === 'action'),
    search: filteredActions.filter(a => a.category === 'search'),
  };

  // AI command suggestions
  const aiSuggestions = getCommandSuggestions(input);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setInput('');
      setCommandState('idle');
      setParsedCommand(null);
      setSelectedIndex(0);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = filteredActions.length + aiSuggestions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (commandState === 'processing') return;
        
        if (selectedIndex < filteredActions.length) {
          filteredActions[selectedIndex].action();
        } else {
          // Use AI suggestion
          const suggestionIndex = selectedIndex - filteredActions.length;
          setInput(aiSuggestions[suggestionIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (aiSuggestions.length > 0) {
          setInput(aiSuggestions[0]);
        }
        break;
    }
  }, [filteredActions, aiSuggestions, selectedIndex, commandState]);

  // Process AI or Vim command
  const processCommand = useCallback(async () => {
    if (!input.trim() || commandState === 'processing') return;
    
    setCommandState('processing');
    setParsedCommand(null);
    setErrorMessage('');
    
    try {
      const trimmedInput = input.trim();
      
      // Phase 3.2: Vim-style commands
      // Bypass AI parsing for manual Vim commands that start with ":"
      if (trimmedInput.startsWith(':')) {
        if (trimmedInput === ':w') {
          // Mock writing/saving scenario to local storage
          localStorage.setItem('macroflow_scenario_snapshot', JSON.stringify({ savedAt: new Date().toISOString() }));
          
          setParsedCommand({
            action: 'update',
            taskTitle: 'Scenario Snapshot',
            confidence: 1,
          });
          
          setCommandState('success');
          
          if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
          }
          
          successTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              close();
              setCommandState('idle');
            }
          }, 1500);
          return;
        } else {
          setCommandState('error');
          setErrorMessage(t('commandBar.unrecognizedCommand') + ' ' + trimmedInput);
          return;
        }
      }

      // Existing Natural Language Parsing
      const command = await parseNaturalLanguageCommand(trimmedInput);
      
      if (command) {
        setParsedCommand(command);
        
        if (onCommand) {
          await onCommand(command);
        }
        
        setCommandState('success');
        
        // Clear any existing timeout
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        
        successTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            close();
            setCommandState('idle');
          }
        }, 1500);
      } else {
        setCommandState('error');
        setErrorMessage(t('commandBar.unrecognizedCommand'));
      }
    } catch {
      setCommandState('error');
      setErrorMessage(t('commandBar.commandFailed'));
    }
  }, [input, commandState, onCommand, t, close]);

  // Voice recording (mock)
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      setIsRecording(false);
      // Mock: Set a transcribed command
      setInput('Move landing page task to Done');
    } else {
      setIsRecording(true);
      // Mock: Stop after 3 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsRecording(false);
          setInput('Move landing page task to Done');
        }
      }, 3000);
    }
  }, [isRecording]);

  // Get action icon based on parsed command
  const getCommandIcon = (action?: string) => {
    switch (action) {
      case 'move': return Move;
      case 'create': return Plus;
      case 'assign': return User;
      case 'notify': return Bell;
      default: return Sparkles;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Command bar dialog - Floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-[640px] -translate-x-1/2 px-4"
          >
            <div className={cn(
              'overflow-hidden rounded-2xl',
              'bg-card/95 backdrop-blur-2xl',
              'border border-border/40',
              'shadow-2xl shadow-black/25',
              'ring-1 ring-white/10'
            )}>
              {/* Input area */}
              <div className="flex items-center gap-3 p-4 border-b border-border/30">
                {commandState === 'processing' ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                ) : commandState === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                ) : commandState === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                ) : (
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('commandBar.aiPlaceholder')}
                  className={cn(
                    'flex-1 bg-transparent outline-none',
                    'text-foreground placeholder:text-muted-foreground/70',
                    'text-base'
                  )}
                  disabled={commandState === 'processing'}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                
                {/* Voice button */}
                <button
                  onClick={toggleRecording}
                  className={cn(
                    'p-2 rounded-lg transition-all shrink-0',
                    isRecording
                      ? 'bg-destructive text-destructive-foreground animate-pulse'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                  title={t('commandBar.voiceInput')}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                
                {/* Execute button */}
                {input.trim() && (
                  <button
                    onClick={processCommand}
                    disabled={!input.trim() || commandState === 'processing'}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0',
                      'bg-primary text-primary-foreground',
                      'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {commandState === 'processing' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('common.run')
                    )}
                  </button>
                )}
                
                {/* Close button */}
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Parsed command preview */}
              {parsedCommand && (
                <div className={cn(
                  'px-4 py-3 border-b border-border/30',
                  'bg-primary/5'
                )}>
                  <div className="flex items-center gap-2 text-sm">
                    {(() => {
                      const Icon = getCommandIcon(parsedCommand.action);
                      return <Icon className="h-4 w-4 text-primary" />;
                    })()}
                    <span className="font-medium capitalize">{parsedCommand.action}</span>
                    {parsedCommand.taskTitle && (
                      <span className="text-muted-foreground">
                        "{parsedCommand.taskTitle}"
                      </span>
                    )}
                    {parsedCommand.targetStatus && (
                      <>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="capitalize">{parsedCommand.targetStatus}</span>
                      </>
                    )}
                    <span className="ms-auto text-xs text-muted-foreground">
                      {Math.round(parsedCommand.confidence * 100)}% {t('commandBar.confidence')}
                    </span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="px-4 py-3 border-b border-border/30 bg-destructive/5">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
                {/* Navigation actions */}
                {groupedActions.navigation.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      Navigation
                    </p>
                    {groupedActions.navigation.map((action, index) => {
                      const Icon = action.icon;
                      const globalIndex = index;
                      return (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start',
                            'transition-all duration-150',
                            selectedIndex === globalIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/70'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            selectedIndex === globalIndex ? 'bg-primary/20' : 'bg-muted'
                          )}>
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{action.label}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {action.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action items */}
                {groupedActions.action.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      Actions
                    </p>
                    {groupedActions.action.map((action, index) => {
                      const Icon = action.icon;
                      const globalIndex = groupedActions.navigation.length + index;
                      return (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start',
                            'transition-all duration-150',
                            selectedIndex === globalIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/70'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            selectedIndex === globalIndex ? 'bg-primary/20' : 'bg-muted'
                          )}>
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{action.label}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {action.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Search items */}
                {groupedActions.search.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      Search
                    </p>
                    {groupedActions.search.map((action, index) => {
                      const Icon = action.icon;
                      const globalIndex = groupedActions.navigation.length + groupedActions.action.length + index;
                      return (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start',
                            'transition-all duration-150',
                            selectedIndex === globalIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/70'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            selectedIndex === globalIndex ? 'bg-primary/20' : 'bg-muted'
                          )}>
                            <Icon className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{action.label}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {action.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AI suggestions */}
                {aiSuggestions.length > 0 && input.trim() && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      AI Suggestions
                    </p>
                    {aiSuggestions.map((suggestion, index) => {
                      const actualIndex = filteredActions.length + index;
                      return (
                        <button
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-start',
                            'transition-all duration-150',
                            selectedIndex === actualIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/70'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            selectedIndex === actualIndex ? 'bg-primary/20' : 'bg-gradient-to-br from-primary/20 to-purple-500/20'
                          )}>
                            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                          </div>
                          <p className="text-sm flex-1">{suggestion}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/20">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>AI-powered commands</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">esc</kbd>
                    close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Trigger Button Component
// ============================================================================

export function CommandBarTrigger({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { open } = useCommandBar();

  return (
    <button
      onClick={open}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-muted/50 hover:bg-muted text-muted-foreground',
        'border border-transparent hover:border-border/50',
        'transition-all duration-200',
        'group',
        className
      )}
    >
      <Search className="h-4 w-4 group-hover:text-foreground transition-colors" />
      <span className="text-sm hidden sm:inline group-hover:text-foreground transition-colors">
        {t('commandBar.placeholder')}
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background/80 rounded border border-border/50 text-muted-foreground">
        <Command className="h-2.5 w-2.5" />K
      </kbd>
    </button>
  );
}

export default CommandBar;
