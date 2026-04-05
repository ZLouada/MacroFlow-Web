import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Command as CommandIcon,
  Settings,
  Save,
  FolderOpen,
  RotateCcw,
  Play,
  Pause,
  Download,
  Sun,
  Moon,
  Globe,
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  HelpCircle,
  Keyboard,
  X,
  ChevronRight,
} from 'lucide-react';
import { useEconomicStore, useEconomicActions } from '@/lib/stores/economicStore';
import { useScenarioStore } from '@/lib/stores/scenarioStore';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  keywords?: string[];
  category: CommandCategory;
  action: () => void | Promise<void>;
  disabled?: boolean;
}

export type CommandCategory =
  | 'navigation'
  | 'actions'
  | 'scenarios'
  | 'simulation'
  | 'settings'
  | 'help'
  | 'vim';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Vim Command Parser
// ============================================================================

interface VimCommand {
  command: string;
  args: string[];
  isValid: boolean;
  description?: string;
}

function parseVimCommand(input: string): VimCommand | null {
  if (!input.startsWith(':')) return null;
  
  const parts = input.slice(1).trim().split(/\s+/);
  const command = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);

  const validCommands: Record<string, string> = {
    'w': 'Save current scenario',
    'wq': 'Save and close palette',
    'q': 'Close command palette',
    'q!': 'Force close without saving',
    'reset': 'Reset to default values',
    'run': 'Start simulation',
    'stop': 'Stop simulation',
    'step': 'Step simulation forward',
    'load': 'Load scenario by name',
    'export': 'Export all scenarios',
    'import': 'Import scenarios from file',
    'set': 'Change setting (e.g., :set dark)',
    'help': 'Show help',
    'lang': 'Change language (en/fr/ar)',
    'fiscal': 'Adjust fiscal policy',
    'monetary': 'Adjust monetary policy',
    'g': 'Set government spending',
    't': 'Set tax rate',
    'm': 'Set money supply',
    'r': 'Set interest rate',
  };

  return {
    command,
    args,
    isValid: command in validCommands,
    description: validCommands[command],
  };
}

// ============================================================================
// Command Palette Component
// ============================================================================

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>(['home']);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stores
  const economicStore = useEconomicStore();
  const economicActions = useEconomicActions();
  const scenarioStore = useScenarioStore();
  const { changeLanguage, currentLanguage } = useLanguage();

  // Current page
  const activePage = pages[pages.length - 1];
  const isHome = activePage === 'home';

  // Check if input is a vim command
  const vimCommand = useMemo(() => parseVimCommand(search), [search]);
  const isVimMode = vimCommand !== null;

  // Handle vim command execution
  const executeVimCommand = useCallback(async () => {
    if (!vimCommand || !vimCommand.isValid) return;

    const { command, args } = vimCommand;

    switch (command) {
      case 'w':
        // Save current state as scenario
        const name = args[0] || `Scenario ${Date.now()}`;
        scenarioStore.createScenario(name, {
          fiscalPolicy: economicStore.fiscalPolicy,
          monetaryPolicy: economicStore.monetaryPolicy,
          externalSector: economicStore.externalSector,
          parameters: economicStore.parameters,
        });
        break;

      case 'wq':
        const saveName = args[0] || `Scenario ${Date.now()}`;
        scenarioStore.createScenario(saveName, {
          fiscalPolicy: economicStore.fiscalPolicy,
          monetaryPolicy: economicStore.monetaryPolicy,
          externalSector: economicStore.externalSector,
          parameters: economicStore.parameters,
        });
        onClose();
        break;

      case 'q':
      case 'q!':
        onClose();
        break;

      case 'reset':
        economicActions.resetToDefaults();
        break;

      case 'run':
        economicActions.startSimulation();
        break;

      case 'stop':
        economicActions.stopSimulation();
        break;

      case 'step':
        economicActions.stepSimulation();
        break;

      case 'load':
        const scenarioName = args.join(' ');
        const scenario = scenarioStore.scenarios.find(
          (s) => s.name.toLowerCase() === scenarioName.toLowerCase()
        );
        if (scenario) {
          economicActions.updateFiscalPolicy(scenario.fiscalPolicy);
          economicActions.updateMonetaryPolicy(scenario.monetaryPolicy);
          economicActions.updateExternalSector(scenario.externalSector);
          economicActions.updateParameters(scenario.parameters);
          economicActions.recalculateEquilibrium();
        }
        break;

      case 'export':
        const json = scenarioStore.exportScenarios();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `macroflow-scenarios-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;

      case 'lang':
        const lang = args[0] as 'en' | 'fr' | 'ar';
        if (['en', 'fr', 'ar'].includes(lang)) {
          await changeLanguage(lang);
        }
        break;

      case 'set':
        const setting = args[0]?.toLowerCase();
        if (setting === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (setting === 'light') {
          document.documentElement.classList.remove('dark');
        }
        break;

      case 'g':
        const gValue = parseFloat(args[0]);
        if (!isNaN(gValue)) {
          economicActions.setGovernmentSpending(gValue);
          economicActions.recalculateEquilibrium();
        }
        break;

      case 't':
        const tValue = parseFloat(args[0]);
        if (!isNaN(tValue)) {
          economicActions.setTaxRate(tValue <= 1 ? tValue : tValue / 100);
          economicActions.recalculateEquilibrium();
        }
        break;

      case 'm':
        const mValue = parseFloat(args[0]);
        if (!isNaN(mValue)) {
          economicActions.setMoneySupply(mValue);
          economicActions.recalculateEquilibrium();
        }
        break;

      case 'r':
        const rValue = parseFloat(args[0]);
        if (!isNaN(rValue)) {
          economicActions.setInterestRate(rValue <= 1 ? rValue : rValue / 100);
          economicActions.recalculateEquilibrium();
        }
        break;

      case 'help':
        setPages([...pages, 'help']);
        break;
    }

    setSearch('');
  }, [vimCommand, scenarioStore, economicStore, economicActions, onClose, changeLanguage, pages]);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => [
    // Navigation
    {
      id: 'dashboard',
      label: t('commands.dashboard', 'Go to Dashboard'),
      icon: <Activity className="w-4 h-4" />,
      shortcut: ['G', 'D'],
      category: 'navigation',
      action: () => { /* navigate to dashboard */ },
    },
    {
      id: 'settings',
      label: t('commands.settings', 'Open Settings'),
      icon: <Settings className="w-4 h-4" />,
      shortcut: ['G', 'S'],
      category: 'navigation',
      action: () => setPages([...pages, 'settings']),
    },

    // Actions
    {
      id: 'save-scenario',
      label: t('commands.saveScenario', 'Save Current Scenario'),
      description: t('commands.saveScenarioDesc', 'Save current parameters as a named scenario'),
      icon: <Save className="w-4 h-4" />,
      shortcut: ['⌘', 'S'],
      keywords: ['save', 'scenario', 'snapshot'],
      category: 'actions',
      action: () => {
        scenarioStore.createScenario(`Scenario ${Date.now()}`, {
          fiscalPolicy: economicStore.fiscalPolicy,
          monetaryPolicy: economicStore.monetaryPolicy,
          externalSector: economicStore.externalSector,
          parameters: economicStore.parameters,
        });
        onClose();
      },
    },
    {
      id: 'load-scenario',
      label: t('commands.loadScenario', 'Load Scenario'),
      description: t('commands.loadScenarioDesc', 'Load a saved scenario'),
      icon: <FolderOpen className="w-4 h-4" />,
      shortcut: ['⌘', 'O'],
      keywords: ['load', 'open', 'scenario'],
      category: 'actions',
      action: () => setPages([...pages, 'scenarios']),
    },
    {
      id: 'reset',
      label: t('commands.reset', 'Reset to Defaults'),
      description: t('commands.resetDesc', 'Reset all parameters to default values'),
      icon: <RotateCcw className="w-4 h-4" />,
      keywords: ['reset', 'default', 'clear'],
      category: 'actions',
      action: () => {
        economicActions.resetToDefaults();
        onClose();
      },
    },
    {
      id: 'export',
      label: t('commands.export', 'Export Scenarios'),
      icon: <Download className="w-4 h-4" />,
      keywords: ['export', 'download', 'backup'],
      category: 'actions',
      action: () => {
        const json = scenarioStore.exportScenarios();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'macroflow-scenarios.json';
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      },
    },

    // Simulation
    {
      id: 'start-sim',
      label: economicStore.simulation.isRunning
        ? t('commands.stopSimulation', 'Stop Simulation')
        : t('commands.startSimulation', 'Start Simulation'),
      icon: economicStore.simulation.isRunning
        ? <Pause className="w-4 h-4" />
        : <Play className="w-4 h-4" />,
      shortcut: ['Space'],
      keywords: ['simulation', 'run', 'start', 'stop'],
      category: 'simulation',
      action: () => {
        if (economicStore.simulation.isRunning) {
          economicActions.stopSimulation();
        } else {
          economicActions.startSimulation();
        }
      },
    },
    {
      id: 'step-sim',
      label: t('commands.stepSimulation', 'Step Simulation'),
      icon: <ChevronRight className="w-4 h-4" />,
      keywords: ['step', 'next', 'forward'],
      category: 'simulation',
      action: () => {
        economicActions.stepSimulation();
      },
    },

    // Fiscal Policy Shortcuts
    {
      id: 'increase-g',
      label: t('commands.increaseG', 'Increase Government Spending'),
      icon: <TrendingUp className="w-4 h-4" />,
      keywords: ['fiscal', 'spending', 'increase', 'expansionary'],
      category: 'actions',
      action: () => {
        economicActions.setGovernmentSpending(economicStore.fiscalPolicy.governmentSpending * 1.1);
        economicActions.recalculateEquilibrium();
      },
    },
    {
      id: 'decrease-g',
      label: t('commands.decreaseG', 'Decrease Government Spending'),
      icon: <TrendingDown className="w-4 h-4" />,
      keywords: ['fiscal', 'spending', 'decrease', 'contractionary'],
      category: 'actions',
      action: () => {
        economicActions.setGovernmentSpending(economicStore.fiscalPolicy.governmentSpending * 0.9);
        economicActions.recalculateEquilibrium();
      },
    },
    {
      id: 'increase-m',
      label: t('commands.increaseM', 'Increase Money Supply'),
      icon: <DollarSign className="w-4 h-4" />,
      keywords: ['monetary', 'money', 'increase', 'expansionary'],
      category: 'actions',
      action: () => {
        economicActions.setMoneySupply(economicStore.monetaryPolicy.moneySupply * 1.1);
        economicActions.recalculateEquilibrium();
      },
    },
    {
      id: 'decrease-m',
      label: t('commands.decreaseM', 'Decrease Money Supply'),
      icon: <DollarSign className="w-4 h-4" />,
      keywords: ['monetary', 'money', 'decrease', 'contractionary'],
      category: 'actions',
      action: () => {
        economicActions.setMoneySupply(economicStore.monetaryPolicy.moneySupply * 0.9);
        economicActions.recalculateEquilibrium();
      },
    },

    // Settings
    {
      id: 'toggle-theme',
      label: t('commands.toggleTheme', 'Toggle Dark Mode'),
      icon: document.documentElement.classList.contains('dark')
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />,
      shortcut: ['⌘', 'T'],
      keywords: ['theme', 'dark', 'light', 'mode'],
      category: 'settings',
      action: () => {
        document.documentElement.classList.toggle('dark');
      },
    },
    {
      id: 'change-language',
      label: t('commands.changeLanguage', 'Change Language'),
      icon: <Globe className="w-4 h-4" />,
      keywords: ['language', 'locale', 'translation'],
      category: 'settings',
      action: () => setPages([...pages, 'language']),
    },

    // Help
    {
      id: 'glossary',
      label: t('commands.glossary', 'Open Glossary'),
      icon: <BookOpen className="w-4 h-4" />,
      keywords: ['glossary', 'terms', 'definitions', 'help'],
      category: 'help',
      action: () => { /* open glossary */ },
    },
    {
      id: 'shortcuts',
      label: t('commands.shortcuts', 'Keyboard Shortcuts'),
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: ['?'],
      keywords: ['keyboard', 'shortcuts', 'hotkeys'],
      category: 'help',
      action: () => setPages([...pages, 'shortcuts']),
    },
    {
      id: 'help',
      label: t('commands.help', 'Help'),
      icon: <HelpCircle className="w-4 h-4" />,
      keywords: ['help', 'documentation', 'guide'],
      category: 'help',
      action: () => setPages([...pages, 'help']),
    },
  ], [t, economicStore, economicActions, scenarioStore, onClose, pages]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      navigation: [],
      actions: [],
      scenarios: [],
      simulation: [],
      settings: [],
      help: [],
      vim: [],
    };

    commands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [commands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape to go back in pages or close
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (pages.length > 1) {
        setPages(pages.slice(0, -1));
      } else {
        onClose();
      }
    }
    if (e.key === 'Backspace' && !search && pages.length > 1) {
      setPages(pages.slice(0, -1));
    }
    if (e.key === 'Enter' && isVimMode && vimCommand?.isValid) {
      e.preventDefault();
      executeVimCommand();
    }
  }, [pages, search, onClose, isVimMode, vimCommand, executeVimCommand]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <Command
              className={cn(
                'rounded-xl overflow-hidden',
                'bg-white/95 dark:bg-gray-900/95',
                'backdrop-blur-xl',
                'border border-gray-200/50 dark:border-gray-700/50',
                'shadow-2xl'
              )}
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                {isVimMode ? (
                  <CommandIcon className="w-5 h-5 text-amber-500 mr-3" />
                ) : (
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                )}
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder={isHome 
                    ? t('commands.placeholder', 'Type a command or :help for vim mode...')
                    : t('commands.searchIn', 'Search in {{page}}...', { page: activePage })
                  }
                  className={cn(
                    'flex-1 h-14 bg-transparent outline-none',
                    'text-gray-900 dark:text-white placeholder-gray-400',
                    isVimMode && 'font-mono text-amber-500'
                  )}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Vim Command Preview */}
              {isVimMode && vimCommand && (
                <div className={cn(
                  'px-4 py-2 border-b border-gray-200 dark:border-gray-700',
                  'bg-amber-50 dark:bg-amber-900/20'
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-mono text-amber-700 dark:text-amber-400">
                        :{vimCommand.command}
                        {vimCommand.args.length > 0 && ` ${vimCommand.args.join(' ')}`}
                      </span>
                    </div>
                    {vimCommand.isValid ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {vimCommand.description}
                      </span>
                    ) : (
                      <span className="text-xs text-red-500">
                        Unknown command
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Command List */}
              <Command.List className="max-h-[400px] overflow-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                  {t('commands.noResults', 'No results found.')}
                </Command.Empty>

                {isHome && !isVimMode && (
                  <>
                    {/* Quick Actions */}
                    {groupedCommands.actions.length > 0 && (
                      <Command.Group heading={t('commands.actions', 'Actions')}>
                        {groupedCommands.actions.map((cmd) => (
                          <CommandItemComponent key={cmd.id} item={cmd} onSelect={onClose} />
                        ))}
                      </Command.Group>
                    )}

                    {/* Simulation */}
                    {groupedCommands.simulation.length > 0 && (
                      <Command.Group heading={t('commands.simulation', 'Simulation')}>
                        {groupedCommands.simulation.map((cmd) => (
                          <CommandItemComponent key={cmd.id} item={cmd} onSelect={onClose} />
                        ))}
                      </Command.Group>
                    )}

                    {/* Settings */}
                    {groupedCommands.settings.length > 0 && (
                      <Command.Group heading={t('commands.settings', 'Settings')}>
                        {groupedCommands.settings.map((cmd) => (
                          <CommandItemComponent key={cmd.id} item={cmd} onSelect={onClose} />
                        ))}
                      </Command.Group>
                    )}

                    {/* Help */}
                    {groupedCommands.help.length > 0 && (
                      <Command.Group heading={t('commands.help', 'Help')}>
                        {groupedCommands.help.map((cmd) => (
                          <CommandItemComponent key={cmd.id} item={cmd} onSelect={onClose} />
                        ))}
                      </Command.Group>
                    )}
                  </>
                )}

                {/* Scenarios Page */}
                {activePage === 'scenarios' && (
                  <Command.Group heading={t('commands.savedScenarios', 'Saved Scenarios')}>
                    {scenarioStore.scenarios.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-500">
                        {t('commands.noScenarios', 'No scenarios saved yet')}
                      </div>
                    ) : (
                      scenarioStore.scenarios.map((scenario) => (
                        <Command.Item
                          key={scenario.id}
                          value={scenario.name}
                          onSelect={() => {
                            economicActions.updateFiscalPolicy(scenario.fiscalPolicy);
                            economicActions.updateMonetaryPolicy(scenario.monetaryPolicy);
                            economicActions.updateExternalSector(scenario.externalSector);
                            economicActions.updateParameters(scenario.parameters);
                            economicActions.recalculateEquilibrium();
                            scenarioStore.setActiveScenario(scenario.id);
                            onClose();
                          }}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                            'text-gray-700 dark:text-gray-300',
                            'aria-selected:bg-primary-100 dark:aria-selected:bg-primary-900/30',
                            'aria-selected:text-primary-900 dark:aria-selected:text-primary-100'
                          )}
                        >
                          <FolderOpen className="w-4 h-4" />
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{scenario.name}</span>
                            {scenario.description && (
                              <span className="block text-xs text-gray-500 truncate">
                                {scenario.description}
                              </span>
                            )}
                          </div>
                        </Command.Item>
                      ))
                    )}
                  </Command.Group>
                )}

                {/* Language Page */}
                {activePage === 'language' && (
                  <Command.Group heading={t('commands.selectLanguage', 'Select Language')}>
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸' },
                      { code: 'fr', name: 'Français', flag: '🇫🇷' },
                      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    ].map((lang) => (
                      <Command.Item
                        key={lang.code}
                        value={lang.name}
                        onSelect={() => {
                          changeLanguage(lang.code as 'en' | 'fr' | 'ar');
                          onClose();
                        }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
                          'text-gray-700 dark:text-gray-300',
                          'aria-selected:bg-primary-100 dark:aria-selected:bg-primary-900/30',
                          currentLanguage === lang.code && 'bg-primary-50 dark:bg-primary-900/20'
                        )}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {currentLanguage === lang.code && (
                          <span className="ml-auto text-xs text-primary-500">Active</span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Shortcuts Page */}
                {activePage === 'shortcuts' && (
                  <Command.Group heading={t('commands.keyboardShortcuts', 'Keyboard Shortcuts')}>
                    <div className="px-3 py-2 space-y-3 text-sm">
                      <ShortcutRow keys={['⌘', 'K']} description="Open command palette" />
                      <ShortcutRow keys={['⌘', 'S']} description="Save scenario" />
                      <ShortcutRow keys={['⌘', 'O']} description="Load scenario" />
                      <ShortcutRow keys={['Space']} description="Toggle simulation" />
                      <ShortcutRow keys={['Esc']} description="Close / Go back" />
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Vim Commands</p>
                        <ShortcutRow keys={[':w']} description="Save scenario" />
                        <ShortcutRow keys={[':q']} description="Close palette" />
                        <ShortcutRow keys={[':reset']} description="Reset to defaults" />
                        <ShortcutRow keys={[':run']} description="Start simulation" />
                        <ShortcutRow keys={[':g 500']} description="Set G to 500" />
                        <ShortcutRow keys={[':t 0.25']} description="Set tax rate to 25%" />
                        <ShortcutRow keys={[':lang ar']} description="Switch to Arabic" />
                      </div>
                    </div>
                  </Command.Group>
                )}

                {/* Help Page */}
                {activePage === 'help' && (
                  <Command.Group heading={t('commands.helpTopics', 'Help Topics')}>
                    <div className="px-3 py-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>MacroFlow</strong> is an economic simulation platform based on the Mundell-Fleming IS-LM-BOP model.
                      </p>
                      <p>
                        Use this command palette to quickly navigate, adjust parameters, and manage scenarios.
                      </p>
                      <p>
                        <strong>Vim Mode:</strong> Start your command with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">:</code> to use vim-style commands.
                      </p>
                    </div>
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">esc</kbd>
                    {pages.length > 1 ? 'back' : 'close'}
                  </span>
                </div>
                <span className="text-gray-400">
                  {isVimMode ? 'Vim mode' : 'MacroFlow'}
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Command Item Component
// ============================================================================

interface CommandItemComponentProps {
  item: CommandItem;
  onSelect: () => void;
}

function CommandItemComponent({ item, onSelect }: CommandItemComponentProps) {
  return (
    <Command.Item
      value={item.label}
      onSelect={() => {
        item.action();
        if (!item.label.includes('Open') && !item.label.includes('Go to')) {
          onSelect();
        }
      }}
      disabled={item.disabled}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer',
        'text-gray-700 dark:text-gray-300',
        'aria-selected:bg-primary-100 dark:aria-selected:bg-primary-900/30',
        'aria-selected:text-primary-900 dark:aria-selected:text-primary-100',
        item.disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {item.icon && (
        <span className="text-gray-400">{item.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <span className="block truncate">{item.label}</span>
        {item.description && (
          <span className="block text-xs text-gray-500 truncate">
            {item.description}
          </span>
        )}
      </div>
      {item.shortcut && (
        <div className="flex items-center gap-1">
          {item.shortcut.map((key, i) => (
            <kbd
              key={i}
              className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </Command.Item>
  );
}

// ============================================================================
// Shortcut Row Component
// ============================================================================

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 dark:text-gray-400">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Hook for Command Palette
// ============================================================================

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}

export default CommandPalette;
