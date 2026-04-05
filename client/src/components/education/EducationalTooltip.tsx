import { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Info, BookOpen, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type TooltipCategory = 
  | 'fiscal'
  | 'monetary'
  | 'external'
  | 'indicator'
  | 'model'
  | 'general';

export interface EconomicTerm {
  id: string;
  term: string;
  shortDefinition: string;
  fullDefinition?: string;
  formula?: string;
  example?: string;
  relatedTerms?: string[];
  category: TooltipCategory;
  learnMoreUrl?: string;
}

export interface EducationalTooltipProps {
  term: EconomicTerm | string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  showIcon?: boolean;
  variant?: 'inline' | 'icon' | 'underline';
  className?: string;
}

// ============================================================================
// Economic Terms Database
// ============================================================================

export const economicTerms: Record<string, EconomicTerm> = {
  // Fiscal Policy
  taxRate: {
    id: 'taxRate',
    term: 'Tax Rate',
    shortDefinition: 'The percentage of income collected by the government as taxes.',
    fullDefinition: 'The tax rate (t) determines what fraction of national income goes to the government. Higher tax rates reduce disposable income and consumption, but increase government revenue. In the IS-LM model, taxes reduce the multiplier effect.',
    formula: 'Tax Revenue (T) = t × Y',
    example: 'If t = 0.25 and GDP = $2000B, tax revenue = $500B',
    relatedTerms: ['fiscalMultiplier', 'disposableIncome', 'governmentSpending'],
    category: 'fiscal',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Tax_rate',
  },
  governmentSpending: {
    id: 'governmentSpending',
    term: 'Government Spending',
    shortDefinition: 'Expenditure by the government on goods and services.',
    fullDefinition: 'Government spending (G) is a component of aggregate demand. Increases in G shift the IS curve right, raising equilibrium output. Under the Keynesian multiplier, the effect on GDP is greater than the initial spending change.',
    formula: 'Y = C + I + G + (X - M)',
    example: 'A $100B increase in G with multiplier 2 raises GDP by $200B',
    relatedTerms: ['fiscalMultiplier', 'isCurve', 'budgetDeficit'],
    category: 'fiscal',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Government_spending',
  },
  fiscalMultiplier: {
    id: 'fiscalMultiplier',
    term: 'Fiscal Multiplier',
    shortDefinition: 'The ratio of change in GDP to change in government spending.',
    fullDefinition: 'The fiscal multiplier measures how much GDP changes for each dollar of government spending. It depends on the marginal propensity to consume (MPC), tax rate, and import propensity. A higher MPC leads to a larger multiplier.',
    formula: 'k = 1 / (1 - MPC(1-t) + m)',
    example: 'With MPC=0.75, t=0.25, m=0.2, multiplier ≈ 1.74',
    relatedTerms: ['taxRate', 'marginalPropensityConsume', 'governmentSpending'],
    category: 'fiscal',
  },
  
  // Monetary Policy
  moneySupply: {
    id: 'moneySupply',
    term: 'Money Supply',
    shortDefinition: 'The total amount of money circulating in the economy.',
    fullDefinition: 'Money supply (M) is controlled by the central bank through open market operations, reserve requirements, and the discount rate. Increasing M shifts the LM curve right, lowering interest rates and stimulating investment.',
    formula: 'M/P = L(Y, r)',
    example: 'Central bank buys bonds → M increases → r falls → Investment rises',
    relatedTerms: ['lmCurve', 'interestRate', 'reserveRequirement'],
    category: 'monetary',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Money_supply',
  },
  interestRate: {
    id: 'interestRate',
    term: 'Interest Rate',
    shortDefinition: 'The cost of borrowing money or return on savings.',
    fullDefinition: 'The interest rate (r) is determined by the intersection of money demand and supply. It affects investment decisions and capital flows. In the IS-LM model, r is the key link between the goods market (IS) and money market (LM).',
    formula: 'M/P = kY - hr (LM curve)',
    example: 'If r falls from 5% to 3%, investment increases, shifting IS right',
    relatedTerms: ['moneySupply', 'investment', 'capitalMobility'],
    category: 'monetary',
  },
  reserveRequirement: {
    id: 'reserveRequirement',
    term: 'Reserve Requirement',
    shortDefinition: 'Minimum fraction of deposits banks must hold as reserves.',
    fullDefinition: 'The reserve requirement (RR) affects the money multiplier. Lower RR allows banks to lend more, expanding the money supply. It\'s a monetary policy tool, though less frequently used than open market operations.',
    formula: 'Money Multiplier = 1 / RR',
    example: 'RR = 10% → Money multiplier = 10. $100 deposit can create $1000 in loans.',
    relatedTerms: ['moneySupply', 'monetaryPolicy'],
    category: 'monetary',
  },
  
  // External Sector
  exchangeRate: {
    id: 'exchangeRate',
    term: 'Exchange Rate',
    shortDefinition: 'The price of domestic currency in terms of foreign currency.',
    fullDefinition: 'The exchange rate (e) affects trade competitiveness. A depreciation (higher e) makes exports cheaper and imports more expensive, improving the trade balance. Under floating rates, e adjusts to equilibrate the BOP.',
    formula: 'NX = X(e) - M(Y, e)',
    example: 'If e rises from 1.0 to 1.2, exports become cheaper abroad',
    relatedTerms: ['tradeBalance', 'capitalMobility', 'bopCurve'],
    category: 'external',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Exchange_rate',
  },
  capitalMobility: {
    id: 'capitalMobility',
    term: 'Capital Mobility',
    shortDefinition: 'The ease with which capital flows between countries.',
    fullDefinition: 'Capital mobility determines the slope of the BOP curve. Perfect mobility (horizontal BOP) means any interest rate difference triggers infinite capital flows. Imperfect mobility creates an upward-sloping BOP curve.',
    formula: 'CF = f(r - r*) where f\' > 0',
    example: 'Perfect mobility: domestic r must equal world r* in equilibrium',
    relatedTerms: ['bopCurve', 'interestRate', 'exchangeRate'],
    category: 'external',
  },
  tradeBalance: {
    id: 'tradeBalance',
    term: 'Trade Balance',
    shortDefinition: 'The difference between exports and imports.',
    fullDefinition: 'The trade balance (NX = X - M) is part of the current account. A surplus means exports exceed imports. In the Mundell-Fleming model, NX depends on domestic income (Y), exchange rate (e), and foreign income.',
    formula: 'NX = X - M = X(e, Y*) - M(Y, e)',
    example: 'If exports = $300B and imports = $280B, trade surplus = $20B',
    relatedTerms: ['exchangeRate', 'bopCurve', 'currentAccount'],
    category: 'external',
  },
  
  // Model Components
  isCurve: {
    id: 'isCurve',
    term: 'IS Curve',
    shortDefinition: 'Shows combinations of r and Y where goods market is in equilibrium.',
    fullDefinition: 'The IS (Investment-Savings) curve represents equilibrium in the goods market. It slopes downward because lower interest rates stimulate investment, raising equilibrium output. Fiscal policy shifts the IS curve.',
    formula: 'Y = C(Y-T) + I(r) + G + NX',
    example: 'Increase in G shifts IS right → higher Y at same r',
    relatedTerms: ['lmCurve', 'bopCurve', 'fiscalPolicy'],
    category: 'model',
  },
  lmCurve: {
    id: 'lmCurve',
    term: 'LM Curve',
    shortDefinition: 'Shows combinations of r and Y where money market is in equilibrium.',
    fullDefinition: 'The LM (Liquidity-Money) curve represents equilibrium in the money market. It slopes upward because higher income increases money demand, requiring higher interest rates to maintain equilibrium. Monetary policy shifts the LM curve.',
    formula: 'M/P = L(Y, r) = kY - hr',
    example: 'Increase in M shifts LM right → lower r at same Y',
    relatedTerms: ['isCurve', 'bopCurve', 'monetaryPolicy'],
    category: 'model',
  },
  bopCurve: {
    id: 'bopCurve',
    term: 'BOP Curve',
    shortDefinition: 'Shows combinations of r and Y where balance of payments is in equilibrium.',
    fullDefinition: 'The BOP (Balance of Payments) curve represents external equilibrium. Its slope depends on capital mobility: horizontal with perfect mobility, vertical with no mobility. BOP = Current Account + Capital Account = 0 in equilibrium.',
    formula: 'BOP = NX(Y, e) + CF(r - r*) = 0',
    example: 'With perfect capital mobility, BOP is horizontal at r = r*',
    relatedTerms: ['isCurve', 'lmCurve', 'capitalMobility'],
    category: 'model',
  },
  
  // Indicators
  gdp: {
    id: 'gdp',
    term: 'GDP',
    shortDefinition: 'The total value of goods and services produced in an economy.',
    fullDefinition: 'Gross Domestic Product (Y) measures the total economic output. It equals the sum of consumption, investment, government spending, and net exports. Real GDP is adjusted for inflation, while nominal GDP is in current prices.',
    formula: 'Y = C + I + G + (X - M)',
    example: 'If C=$1400B, I=$400B, G=$500B, NX=$20B → Y=$2320B',
    relatedTerms: ['outputGap', 'potentialOutput', 'economicGrowth'],
    category: 'indicator',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Gross_domestic_product',
  },
  inflation: {
    id: 'inflation',
    term: 'Inflation',
    shortDefinition: 'The rate at which the general price level is rising.',
    fullDefinition: 'Inflation (π) erodes purchasing power and affects real interest rates. The Phillips Curve suggests a trade-off between inflation and unemployment. Central banks target low, stable inflation (typically 2%).',
    formula: 'π = (P₁ - P₀) / P₀',
    example: 'If prices rise from 100 to 102, inflation = 2%',
    relatedTerms: ['priceLevel', 'realInterestRate', 'phillipsCurve'],
    category: 'indicator',
  },
  unemployment: {
    id: 'unemployment',
    term: 'Unemployment Rate',
    shortDefinition: 'The percentage of the labor force without jobs.',
    fullDefinition: 'The unemployment rate (u) measures labor market slack. It relates to output via Okun\'s Law: a 1% output gap corresponds to roughly 0.5% higher unemployment. Natural unemployment (NAIRU) is the rate consistent with stable inflation.',
    formula: 'u = (Unemployed / Labor Force) × 100',
    example: 'If labor force = 160M and unemployed = 8M, u = 5%',
    relatedTerms: ['outputGap', 'okunsLaw', 'naturalRate'],
    category: 'indicator',
  },
  
  // General Concepts
  equilibrium: {
    id: 'equilibrium',
    term: 'Macroeconomic Equilibrium',
    shortDefinition: 'The state where all markets clear simultaneously.',
    fullDefinition: 'In the IS-LM-BOP model, full equilibrium occurs at the intersection of all three curves. The economy naturally moves toward this point through price and quantity adjustments. Policy changes shift curves, creating new equilibria.',
    formula: 'IS = LM = BOP at (Y*, r*)',
    example: 'At equilibrium: goods market, money market, and external sector all balance',
    relatedTerms: ['isCurve', 'lmCurve', 'bopCurve'],
    category: 'general',
  },
  crowdingOut: {
    id: 'crowdingOut',
    term: 'Crowding Out',
    shortDefinition: 'Reduction in private investment due to increased government borrowing.',
    fullDefinition: 'Crowding out occurs when expansionary fiscal policy raises interest rates, reducing private investment. The extent depends on the LM curve\'s slope and capital mobility. With perfect capital mobility under fixed rates, crowding out is complete.',
    formula: 'ΔI = -b × Δr (where b = investment sensitivity)',
    example: 'G↑ → Y↑ → r↑ → I↓ (partial offset of fiscal stimulus)',
    relatedTerms: ['fiscalPolicy', 'interestRate', 'investment'],
    category: 'general',
  },
  mundellFleming: {
    id: 'mundellFleming',
    term: 'Mundell-Fleming Model',
    shortDefinition: 'The IS-LM model extended for an open economy.',
    fullDefinition: 'The Mundell-Fleming model adds the BOP curve to IS-LM, incorporating international trade and capital flows. Key insight: Policy effectiveness depends on exchange rate regime and capital mobility. Named after Robert Mundell and Marcus Fleming.',
    formula: 'IS-LM-BOP framework',
    example: 'Fixed rate + perfect mobility: Fiscal policy effective, monetary ineffective',
    relatedTerms: ['isCurve', 'lmCurve', 'bopCurve', 'exchangeRate'],
    category: 'model',
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Mundell%E2%80%93Fleming_model',
  },
};

// ============================================================================
// Helper to get term data
// ============================================================================

export function getTermData(term: EconomicTerm | string): EconomicTerm | null {
  if (typeof term === 'object') return term;
  return economicTerms[term] || null;
}

// ============================================================================
// Category Colors
// ============================================================================

const categoryColors: Record<TooltipCategory, { bg: string; text: string; border: string }> = {
  fiscal: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  monetary: {
    bg: 'bg-green-500/10',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-500/20',
  },
  external: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  indicator: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  model: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/20',
  },
  general: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500/20',
  },
};

// ============================================================================
// Educational Tooltip Component
// ============================================================================

export function EducationalTooltip({
  term,
  children,
  side = 'top',
  align = 'center',
  showIcon = false,
  variant = 'inline',
  className,
}: EducationalTooltipProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const termData = getTermData(term);

  if (!termData) {
    return <>{children}</>;
  }

  const colors = categoryColors[termData.category];

  const triggerContent = (
    <>
      {variant === 'underline' ? (
        <span className={cn(
          'border-b border-dashed border-current cursor-help',
          colors.text,
          className
        )}>
          {children}
        </span>
      ) : variant === 'icon' ? (
        <span className={cn('inline-flex items-center gap-1 cursor-help', className)}>
          {children}
          <Info className={cn('w-3.5 h-3.5', colors.text)} />
        </span>
      ) : (
        <span className={cn('cursor-help', className)}>
          {children}
          {showIcon && <Info className={cn('w-3 h-3 inline ml-1', colors.text)} />}
        </span>
      )}
    </>
  );

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {triggerContent}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={8}
            className={cn(
              'z-50 w-80 max-w-[90vw]',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
            )}
          >
            {/* Glassmorphism container */}
            <div className={cn(
              'rounded-xl overflow-hidden',
              'bg-white/80 dark:bg-gray-900/80',
              'backdrop-blur-xl backdrop-saturate-150',
              'border border-white/20 dark:border-gray-700/50',
              'shadow-xl shadow-black/10 dark:shadow-black/30',
              colors.border
            )}>
              {/* Header */}
              <div className={cn(
                'px-4 py-3 border-b border-white/10 dark:border-gray-700/50',
                colors.bg
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className={cn('w-4 h-4', colors.text)} />
                    <span className={cn('text-sm font-semibold', colors.text)}>
                      {termData.term}
                    </span>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    colors.bg,
                    colors.text
                  )}>
                    {termData.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {isExpanded ? termData.fullDefinition || termData.shortDefinition : termData.shortDefinition}
                </p>

                {termData.fullDefinition && termData.fullDefinition !== termData.shortDefinition && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    {isExpanded ? t('tooltip.showLess', 'Show less') : t('tooltip.showMore', 'Show more')}
                  </button>
                )}

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {termData.formula && (
                        <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('tooltip.formula', 'Formula')}:
                          </p>
                          <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                            {termData.formula}
                          </code>
                        </div>
                      )}

                      {termData.example && (
                        <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('tooltip.example', 'Example')}:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {termData.example}
                          </p>
                        </div>
                      )}

                      {termData.relatedTerms && termData.relatedTerms.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('tooltip.relatedTerms', 'Related')}:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {termData.relatedTerms.map((related) => (
                              <span
                                key={related}
                                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {economicTerms[related]?.term || related}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {termData.learnMoreUrl && (
                  <a
                    href={termData.learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
                  >
                    {t('tooltip.learnMore', 'Learn more')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <TooltipPrimitive.Arrow className="fill-white/80 dark:fill-gray-900/80" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// ============================================================================
// Inline Term Component (for use in paragraphs)
// ============================================================================

export function Term({ 
  id, 
  children,
  variant = 'underline',
}: { 
  id: string; 
  children?: ReactNode;
  variant?: EducationalTooltipProps['variant'];
}) {
  const termData = economicTerms[id];
  return (
    <EducationalTooltip term={id} variant={variant}>
      {children || termData?.term || id}
    </EducationalTooltip>
  );
}

// ============================================================================
// Floating Info Button Component
// ============================================================================

interface InfoButtonProps {
  termId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InfoButton({ termId, size = 'sm', className }: InfoButtonProps) {
  const termData = economicTerms[termId];
  if (!termData) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const colors = categoryColors[termData.category];

  return (
    <EducationalTooltip term={termId} variant="inline">
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
          colors.text,
          className
        )}
      >
        <Info className={sizeClasses[size]} />
      </button>
    </EducationalTooltip>
  );
}

// ============================================================================
// Glossary Panel Component
// ============================================================================

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TooltipCategory;
}

export function GlossaryPanel({ isOpen, onClose, category }: GlossaryPanelProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TooltipCategory | 'all'>(category || 'all');

  const filteredTerms = Object.values(economicTerms).filter((term) => {
    const matchesSearch = !searchQuery || 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (TooltipCategory | 'all')[] = ['all', 'fiscal', 'monetary', 'external', 'indicator', 'model', 'general'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('glossary.title', 'Economic Glossary')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('glossary.search', 'Search terms...')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 p-4 border-b border-gray-200 dark:border-gray-700">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-full capitalize transition-colors',
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Terms List */}
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-3">
                {filteredTerms.map((term) => {
                  const colors = categoryColors[term.category];
                  return (
                    <div
                      key={term.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        'bg-white dark:bg-gray-800',
                        colors.border
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={cn('font-medium', colors.text)}>
                          {term.term}
                        </h3>
                        <span className={cn('px-2 py-0.5 text-xs rounded-full', colors.bg, colors.text)}>
                          {term.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {term.shortDefinition}
                      </p>
                      {term.formula && (
                        <code className="block mt-2 text-xs font-mono text-gray-500 dark:text-gray-500">
                          {term.formula}
                        </code>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Hook for Glossary
// ============================================================================

export function useGlossary() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<TooltipCategory | undefined>();

  const open = useCallback((cat?: TooltipCategory) => {
    setCategory(cat);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, category, open, close };
}

export default EducationalTooltip;
