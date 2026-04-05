import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Download,
  Upload,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  X,
  Ghost,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  useScenarioStore,
  useGhostComparison,
  PRESET_NAMES,
  type Scenario,
  type PresetName,
} from '@/lib/stores/scenarioStore';
import { useEconomicStore } from '@/lib/stores/economicStore';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface ScenarioSandboxProps {
  className?: string;
  compact?: boolean;
}

interface ScenarioCardProps {
  scenario: Scenario;
  isActive: boolean;
  isGhost: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSetGhost: () => void;
}

// ============================================================================
// Scenario Card Component
// ============================================================================

function ScenarioCard({
  scenario,
  isActive,
  isGhost,
  onLoad,
  onDelete,
  onDuplicate,
  onSetGhost,
}: ScenarioCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(scenario.updatedAt);
  }, [scenario.updatedAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-lg border transition-all',
        'hover:shadow-md',
        isActive
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        isGhost && 'ring-2 ring-purple-400 ring-opacity-50'
      )}
    >
      <div
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <div className="min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {scenario.name}
              </h4>
              {scenario.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {scenario.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {isGhost && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                Ghost
              </span>
            )}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
                  sideOffset={5}
                >
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none"
                    onSelect={onLoad}
                  >
                    <FolderOpen className="w-4 h-4" />
                    {t('scenarios.load', 'Load')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none"
                    onSelect={onSetGhost}
                  >
                    <Ghost className="w-4 h-4" />
                    {isGhost ? t('scenarios.removeGhost', 'Remove Ghost') : t('scenarios.setAsGhost', 'Set as Ghost')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none"
                    onSelect={onDuplicate}
                  >
                    <Copy className="w-4 h-4" />
                    {t('scenarios.duplicate', 'Duplicate')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 outline-none"
                    onSelect={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('scenarios.delete', 'Delete')}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        {scenario.tags && scenario.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {scenario.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Tax Rate:</span>
                  <span className="ml-1 font-medium">{(scenario.fiscalPolicy.taxRate * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Gov Spending:</span>
                  <span className="ml-1 font-medium">${scenario.fiscalPolicy.governmentSpending}B</span>
                </div>
                <div>
                  <span className="text-gray-500">Money Supply:</span>
                  <span className="ml-1 font-medium">${scenario.monetaryPolicy.moneySupply}B</span>
                </div>
                <div>
                  <span className="text-gray-500">Interest Rate:</span>
                  <span className="ml-1 font-medium">{(scenario.monetaryPolicy.interestRate * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Exchange Regime:</span>
                  <span className="ml-1 font-medium capitalize">{scenario.externalSector.exchangeRateRegime}</span>
                </div>
                <div>
                  <span className="text-gray-500">Capital Mobility:</span>
                  <span className="ml-1 font-medium capitalize">{scenario.externalSector.capitalMobility}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoad();
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 rounded transition-colors"
                >
                  Load Scenario
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Save Dialog Component
// ============================================================================

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string, tags?: string[]) => void;
}

function SaveDialog({ isOpen, onClose, onSave }: SaveDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined, tags.length > 0 ? tags : undefined);
      setName('');
      setDescription('');
      setTags([]);
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('scenarios.saveScenario', 'Save Scenario')}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('scenarios.saveDescription', 'Save current economic parameters as a reusable scenario.')}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('scenarios.name', 'Name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={t('scenarios.namePlaceholder', 'My Economic Scenario')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('scenarios.description', 'Description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder={t('scenarios.descriptionPlaceholder', 'Brief description of this scenario...')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('scenarios.tags', 'Tags')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={t('scenarios.tagPlaceholder', 'Add tag...')}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                {t('common.cancel', 'Cancel')}
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {t('common.save', 'Save')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// Main Scenario Sandbox Component
// ============================================================================

export function ScenarioSandbox({ className, compact = false }: ScenarioSandboxProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Stores
  const scenarioStore = useScenarioStore();
  const economicStore = useEconomicStore();
  const ghostComparison = useGhostComparison();

  // Filter scenarios
  const filteredScenarios = useMemo(() => {
    let filtered = scenarioStore.scenarios;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.tags?.some((t) => t.includes(query))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((s) => s.tags?.includes(selectedTag));
    }

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [scenarioStore.scenarios, searchQuery, selectedTag]);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    scenarioStore.scenarios.forEach((s) => {
      s.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [scenarioStore.scenarios]);

  // Handlers
  const handleSaveScenario = useCallback(
    (name: string, description?: string, tags?: string[]) => {
      scenarioStore.createScenario(
        name,
        {
          fiscalPolicy: economicStore.fiscalPolicy,
          monetaryPolicy: economicStore.monetaryPolicy,
          externalSector: economicStore.externalSector,
          parameters: economicStore.parameters,
        },
        description,
        tags
      );
    },
    [scenarioStore, economicStore]
  );

  const handleLoadScenario = useCallback(
    (scenario: Scenario) => {
      // Save current state as ghost before loading
      if (!ghostComparison.isEnabled) {
        ghostComparison.setSnapshot({
          fiscalPolicy: economicStore.fiscalPolicy,
          monetaryPolicy: economicStore.monetaryPolicy,
          externalSector: economicStore.externalSector,
          parameters: economicStore.parameters,
        });
      }

      // Load scenario into economic store
      economicStore.updateFiscalPolicy(scenario.fiscalPolicy);
      economicStore.updateMonetaryPolicy(scenario.monetaryPolicy);
      economicStore.updateExternalSector(scenario.externalSector);
      economicStore.updateParameters(scenario.parameters);
      economicStore.recalculateEquilibrium();

      scenarioStore.setActiveScenario(scenario.id);
    },
    [economicStore, scenarioStore, ghostComparison]
  );

  const handleLoadPreset = useCallback(
    (presetName: PresetName) => {
      const scenario = scenarioStore.loadPreset(presetName);
      if (scenario) {
        handleLoadScenario(scenario);
      }
    },
    [scenarioStore, handleLoadScenario]
  );

  const handleExport = useCallback(() => {
    const json = scenarioStore.exportScenarios();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macroflow-scenarios-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenarioStore]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const result = scenarioStore.importScenarios(text);
        if (!result.success) {
          console.error('Import errors:', result.errors);
        }
      }
    };
    input.click();
  }, [scenarioStore]);

  const handleToggleGhost = useCallback(
    (scenarioId: string) => {
      if (ghostComparison.isEnabled && scenarioStore.ghost.scenarioId === scenarioId) {
        ghostComparison.disable();
      } else {
        ghostComparison.enable(scenarioId);
      }
    },
    [ghostComparison, scenarioStore.ghost.scenarioId]
  );

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={() => setIsSaveDialogOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={t('scenarios.save', 'Save Scenario')}
        >
          <Save className="w-4 h-4" />
        </button>
        
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('scenarios.load', 'Load Scenario')}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] max-h-[300px] overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
              sideOffset={5}
            >
              {filteredScenarios.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {t('scenarios.noScenarios', 'No scenarios saved')}
                </div>
              ) : (
                filteredScenarios.map((scenario) => (
                  <DropdownMenu.Item
                    key={scenario.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none"
                    onSelect={() => handleLoadScenario(scenario)}
                  >
                    {scenario.name}
                  </DropdownMenu.Item>
                ))
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={() => ghostComparison.isEnabled ? ghostComparison.disable() : ghostComparison.enable()}
          className={cn(
            'p-2 rounded-lg transition-colors',
            ghostComparison.isEnabled
              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
          title={ghostComparison.isEnabled ? t('scenarios.hideGhost', 'Hide Ghost') : t('scenarios.showGhost', 'Show Ghost')}
        >
          {ghostComparison.isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <SaveDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          onSave={handleSaveScenario}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('scenarios.title', 'Scenario Sandbox')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaveDialogOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t('scenarios.save', 'Save')}
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t('scenarios.export', 'Export')}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleImport}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t('scenarios.import', 'Import')}
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ghost Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ghost className={cn('w-5 h-5', ghostComparison.isEnabled ? 'text-purple-500' : 'text-gray-400')} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('scenarios.ghostComparison', 'Ghost Comparison')}
            </span>
          </div>
          <button
            onClick={() => ghostComparison.isEnabled ? ghostComparison.disable() : ghostComparison.enable()}
            className={cn(
              'relative w-10 h-6 rounded-full transition-colors',
              ghostComparison.isEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
              animate={{ left: ghostComparison.isEnabled ? 20 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
        {ghostComparison.isEnabled && ghostComparison.ghostData && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {t('scenarios.ghostActive', 'Ghost lines showing previous state on charts')}
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('scenarios.search', 'Search scenarios...')}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-2 py-1 text-xs rounded-full transition-colors',
                !selectedTag
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  tag === selectedTag
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('scenarios.presets', 'Quick Presets')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_NAMES.slice(0, 4).map((preset) => (
            <button
              key={preset}
              onClick={() => handleLoadPreset(preset)}
              className="px-3 py-2 text-xs text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {preset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-full mt-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              {t('scenarios.morePresets', 'More presets...')}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
              sideOffset={5}
            >
              {PRESET_NAMES.slice(4).map((preset) => (
                <DropdownMenu.Item
                  key={preset}
                  className="px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 outline-none"
                  onSelect={() => handleLoadPreset(preset)}
                >
                  {preset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Scenario List */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="popLayout">
          {filteredScenarios.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? t('scenarios.noResults', 'No scenarios match your search')
                  : t('scenarios.empty', 'No scenarios saved yet')}
              </p>
              <button
                onClick={() => setIsSaveDialogOpen(true)}
                className="mt-3 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                {t('scenarios.saveFirst', 'Save your first scenario')}
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isActive={scenarioStore.activeScenarioId === scenario.id}
                  isGhost={scenarioStore.ghost.scenarioId === scenario.id}
                  onLoad={() => handleLoadScenario(scenario)}
                  onDelete={() => scenarioStore.deleteScenario(scenario.id)}
                  onDuplicate={() => scenarioStore.duplicateScenario(scenario.id)}
                  onSetGhost={() => handleToggleGhost(scenario.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveScenario}
      />
    </div>
  );
}

export default ScenarioSandbox;
