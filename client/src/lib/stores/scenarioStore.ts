import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  FiscalPolicy,
  MonetaryPolicy,
  ExternalSector,
  ModelParameters,
} from './economicStore';

// ============================================================================
// Types
// ============================================================================

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  /** Economic parameters snapshot */
  fiscalPolicy: FiscalPolicy;
  monetaryPolicy: MonetaryPolicy;
  externalSector: ExternalSector;
  parameters: ModelParameters;
}

export interface GhostState {
  /** Whether ghost lines are enabled */
  enabled: boolean;
  /** The scenario ID being compared */
  scenarioId: string | null;
  /** Inline snapshot (for tracking previous state without saving) */
  snapshot: {
    fiscalPolicy: FiscalPolicy;
    monetaryPolicy: MonetaryPolicy;
    externalSector: ExternalSector;
    parameters: ModelParameters;
  } | null;
}

export interface ScenarioSandboxState {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  ghost: GhostState;
  
  // Scenario CRUD
  createScenario: (
    name: string,
    data: {
      fiscalPolicy: FiscalPolicy;
      monetaryPolicy: MonetaryPolicy;
      externalSector: ExternalSector;
      parameters: ModelParameters;
    },
    description?: string,
    tags?: string[]
  ) => Scenario;
  updateScenario: (id: string, updates: Partial<Omit<Scenario, 'id' | 'createdAt'>>) => void;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string, newName?: string) => Scenario | null;
  
  // Scenario selection
  setActiveScenario: (id: string | null) => void;
  getScenario: (id: string) => Scenario | undefined;
  getScenariosByTag: (tag: string) => Scenario[];
  
  // Ghost state management
  enableGhost: (scenarioId?: string) => void;
  disableGhost: () => void;
  setGhostSnapshot: (snapshot: GhostState['snapshot']) => void;
  clearGhostSnapshot: () => void;
  
  // Import/Export
  exportScenarios: () => string;
  importScenarios: (json: string) => { success: boolean; imported: number; errors: string[] };
  
  // Presets
  loadPreset: (presetName: PresetName) => Scenario | null;
}

// ============================================================================
// Preset Scenarios
// ============================================================================

export type PresetName = 
  | 'baseline'
  | 'expansionary_fiscal'
  | 'contractionary_fiscal'
  | 'expansionary_monetary'
  | 'contractionary_monetary'
  | 'fixed_exchange_high_mobility'
  | 'floating_exchange_low_mobility'
  | 'stagflation'
  | 'recession';

const presetScenarios: Record<PresetName, Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>> = {
  baseline: {
    name: 'Baseline Economy',
    description: 'Standard balanced economy with moderate policy settings',
    tags: ['preset', 'balanced'],
    fiscalPolicy: {
      taxRate: 0.25,
      governmentSpending: 500,
      transferPayments: 200,
    },
    monetaryPolicy: {
      moneySupply: 1000,
      interestRate: 0.05,
      reserveRequirement: 0.1,
      discountRate: 0.03,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  expansionary_fiscal: {
    name: 'Expansionary Fiscal Policy',
    description: 'High government spending, lower taxes to stimulate economy',
    tags: ['preset', 'fiscal', 'expansionary'],
    fiscalPolicy: {
      taxRate: 0.20,
      governmentSpending: 700,
      transferPayments: 300,
    },
    monetaryPolicy: {
      moneySupply: 1000,
      interestRate: 0.05,
      reserveRequirement: 0.1,
      discountRate: 0.03,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  contractionary_fiscal: {
    name: 'Contractionary Fiscal Policy',
    description: 'Reduced spending and higher taxes to control inflation',
    tags: ['preset', 'fiscal', 'contractionary'],
    fiscalPolicy: {
      taxRate: 0.35,
      governmentSpending: 350,
      transferPayments: 150,
    },
    monetaryPolicy: {
      moneySupply: 1000,
      interestRate: 0.05,
      reserveRequirement: 0.1,
      discountRate: 0.03,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  expansionary_monetary: {
    name: 'Expansionary Monetary Policy',
    description: 'Increased money supply and lower interest rates',
    tags: ['preset', 'monetary', 'expansionary'],
    fiscalPolicy: {
      taxRate: 0.25,
      governmentSpending: 500,
      transferPayments: 200,
    },
    monetaryPolicy: {
      moneySupply: 1500,
      interestRate: 0.02,
      reserveRequirement: 0.08,
      discountRate: 0.015,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  contractionary_monetary: {
    name: 'Contractionary Monetary Policy',
    description: 'Reduced money supply and higher interest rates',
    tags: ['preset', 'monetary', 'contractionary'],
    fiscalPolicy: {
      taxRate: 0.25,
      governmentSpending: 500,
      transferPayments: 200,
    },
    monetaryPolicy: {
      moneySupply: 750,
      interestRate: 0.08,
      reserveRequirement: 0.15,
      discountRate: 0.06,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  fixed_exchange_high_mobility: {
    name: 'Fixed Exchange + High Capital Mobility',
    description: 'Mundell-Fleming scenario: Fixed exchange rate with perfect capital mobility',
    tags: ['preset', 'mundell-fleming', 'fixed'],
    fiscalPolicy: {
      taxRate: 0.25,
      governmentSpending: 500,
      transferPayments: 200,
    },
    monetaryPolicy: {
      moneySupply: 1000,
      interestRate: 0.04, // Matches world rate
      reserveRequirement: 0.1,
      discountRate: 0.03,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'fixed',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 500,
    },
  },
  
  floating_exchange_low_mobility: {
    name: 'Floating Exchange + Low Capital Mobility',
    description: 'Mundell-Fleming scenario: Floating exchange with limited capital mobility',
    tags: ['preset', 'mundell-fleming', 'floating'],
    fiscalPolicy: {
      taxRate: 0.25,
      governmentSpending: 500,
      transferPayments: 200,
    },
    monetaryPolicy: {
      moneySupply: 1000,
      interestRate: 0.05,
      reserveRequirement: 0.1,
      discountRate: 0.03,
    },
    externalSector: {
      exchangeRate: 1.0,
      exchangeRateRegime: 'floating',
      capitalMobility: 'imperfect',
      worldInterestRate: 0.04,
      exports: 300,
      imports: 280,
      netCapitalFlow: 0,
    },
    parameters: {
      autonomousConsumption: 200,
      marginalPropensityConsume: 0.75,
      investmentSensitivity: 1000,
      autonomousInvestment: 300,
      moneyDemandIncomeSensitivity: 0.5,
      moneyDemandInterestSensitivity: 2000,
      importPropensity: 0.2,
      exportSensitivity: 100,
      capitalFlowSensitivity: 200, // Lower sensitivity
    },
  },
  
  stagflation: {
    name: 'Stagflation Scenario',
    description: 'High inflation combined with economic stagnation',
    tags: ['preset', 'crisis', 'stagflation'],
    fiscalPolicy: {
      taxRate: 0.30,
      governmentSpending: 400,
      transferPayments: 250,
    },
    monetaryPolicy: {
      moneySupply: 1200,
      interestRate: 0.07,
      reserveRequirement: 0.12,
      discountRate: 0.05,
    },
    externalSector: {
      exchangeRate: 1.2,
      exchangeRateRegime: 'floating',
      capitalMobility: 'imperfect',
      worldInterestRate: 0.04,
      exports: 250,
      imports: 350,
      netCapitalFlow: -50,
    },
    parameters: {
      autonomousConsumption: 180,
      marginalPropensityConsume: 0.70,
      investmentSensitivity: 800,
      autonomousInvestment: 250,
      moneyDemandIncomeSensitivity: 0.6,
      moneyDemandInterestSensitivity: 1500,
      importPropensity: 0.25,
      exportSensitivity: 80,
      capitalFlowSensitivity: 300,
    },
  },
  
  recession: {
    name: 'Recession Scenario',
    description: 'Economic downturn with low output and high unemployment',
    tags: ['preset', 'crisis', 'recession'],
    fiscalPolicy: {
      taxRate: 0.28,
      governmentSpending: 450,
      transferPayments: 280,
    },
    monetaryPolicy: {
      moneySupply: 900,
      interestRate: 0.06,
      reserveRequirement: 0.1,
      discountRate: 0.04,
    },
    externalSector: {
      exchangeRate: 0.95,
      exchangeRateRegime: 'floating',
      capitalMobility: 'perfect',
      worldInterestRate: 0.04,
      exports: 270,
      imports: 260,
      netCapitalFlow: 20,
    },
    parameters: {
      autonomousConsumption: 150,
      marginalPropensityConsume: 0.65,
      investmentSensitivity: 1200,
      autonomousInvestment: 200,
      moneyDemandIncomeSensitivity: 0.55,
      moneyDemandInterestSensitivity: 2200,
      importPropensity: 0.18,
      exportSensitivity: 90,
      capitalFlowSensitivity: 450,
    },
  },
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useScenarioStore = create<ScenarioSandboxState>()(
  persist(
    (set, get) => ({
      scenarios: [],
      activeScenarioId: null,
      ghost: {
        enabled: false,
        scenarioId: null,
        snapshot: null,
      },

      // ================================================================
      // Scenario CRUD
      // ================================================================

      createScenario: (name, data, description, tags) => {
        const now = Date.now();
        const scenario: Scenario = {
          id: uuidv4(),
          name,
          description,
          tags,
          createdAt: now,
          updatedAt: now,
          ...data,
        };

        set((state) => ({
          scenarios: [...state.scenarios, scenario],
        }));

        return scenario;
      },

      updateScenario: (id, updates) => {
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id
              ? { ...s, ...updates, updatedAt: Date.now() }
              : s
          ),
        }));
      },

      deleteScenario: (id) => {
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
          ghost: state.ghost.scenarioId === id
            ? { ...state.ghost, scenarioId: null, enabled: false }
            : state.ghost,
        }));
      },

      duplicateScenario: (id, newName) => {
        const original = get().scenarios.find((s) => s.id === id);
        if (!original) return null;

        const now = Date.now();
        const duplicate: Scenario = {
          ...original,
          id: uuidv4(),
          name: newName || `${original.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          scenarios: [...state.scenarios, duplicate],
        }));

        return duplicate;
      },

      // ================================================================
      // Scenario Selection
      // ================================================================

      setActiveScenario: (id) => {
        set({ activeScenarioId: id });
      },

      getScenario: (id) => {
        return get().scenarios.find((s) => s.id === id);
      },

      getScenariosByTag: (tag) => {
        return get().scenarios.filter((s) => s.tags?.includes(tag));
      },

      // ================================================================
      // Ghost State Management
      // ================================================================

      enableGhost: (scenarioId) => {
        const state = get();
        
        if (scenarioId) {
          // Use a saved scenario as ghost
          set({
            ghost: {
              enabled: true,
              scenarioId,
              snapshot: null,
            },
          });
        } else if (state.ghost.snapshot) {
          // Use existing snapshot
          set({
            ghost: {
              ...state.ghost,
              enabled: true,
            },
          });
        }
      },

      disableGhost: () => {
        set((state) => ({
          ghost: {
            ...state.ghost,
            enabled: false,
          },
        }));
      },

      setGhostSnapshot: (snapshot) => {
        set({
          ghost: {
            enabled: true,
            scenarioId: null,
            snapshot,
          },
        });
      },

      clearGhostSnapshot: () => {
        set((state) => ({
          ghost: {
            ...state.ghost,
            snapshot: null,
            enabled: state.ghost.scenarioId !== null,
          },
        }));
      },

      // ================================================================
      // Import/Export
      // ================================================================

      exportScenarios: () => {
        const { scenarios } = get();
        return JSON.stringify(scenarios, null, 2);
      },

      importScenarios: (json) => {
        const errors: string[] = [];
        let imported = 0;

        try {
          const data = JSON.parse(json);
          
          if (!Array.isArray(data)) {
            return { success: false, imported: 0, errors: ['Invalid format: expected array'] };
          }

          const validScenarios: Scenario[] = [];
          const now = Date.now();

          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            
            // Basic validation
            if (!item.name || typeof item.name !== 'string') {
              errors.push(`Item ${i}: Missing or invalid name`);
              continue;
            }
            
            if (!item.fiscalPolicy || !item.monetaryPolicy || !item.externalSector || !item.parameters) {
              errors.push(`Item ${i}: Missing required policy data`);
              continue;
            }

            validScenarios.push({
              ...item,
              id: uuidv4(), // Generate new ID
              createdAt: item.createdAt || now,
              updatedAt: now,
            });
            imported++;
          }

          if (validScenarios.length > 0) {
            set((state) => ({
              scenarios: [...state.scenarios, ...validScenarios],
            }));
          }

          return { success: imported > 0, imported, errors };
        } catch (e) {
          return { 
            success: false, 
            imported: 0, 
            errors: [`Parse error: ${e instanceof Error ? e.message : 'Unknown error'}`] 
          };
        }
      },

      // ================================================================
      // Presets
      // ================================================================

      loadPreset: (presetName) => {
        const preset = presetScenarios[presetName];
        if (!preset) return null;

        const now = Date.now();
        const scenario: Scenario = {
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          ...preset,
        };

        set((state) => ({
          scenarios: [...state.scenarios, scenario],
        }));

        return scenario;
      },
    }),
    {
      name: 'macroflow-scenarios',
    }
  )
);

// ============================================================================
// Hooks for Ghost Data
// ============================================================================

/**
 * Hook to get ghost data for charts
 */
export function useGhostData() {
  const { ghost, scenarios } = useScenarioStore();
  
  if (!ghost.enabled) {
    return null;
  }

  if (ghost.scenarioId) {
    const scenario = scenarios.find((s) => s.id === ghost.scenarioId);
    if (scenario) {
      return {
        fiscalPolicy: scenario.fiscalPolicy,
        monetaryPolicy: scenario.monetaryPolicy,
        externalSector: scenario.externalSector,
        parameters: scenario.parameters,
      };
    }
  }

  return ghost.snapshot;
}

/**
 * Hook to manage ghost state with current economic state
 */
export function useGhostComparison() {
  const store = useScenarioStore();
  
  return {
    isEnabled: store.ghost.enabled,
    ghostData: useGhostData(),
    enable: store.enableGhost,
    disable: store.disableGhost,
    setSnapshot: store.setGhostSnapshot,
    clearSnapshot: store.clearGhostSnapshot,
    scenarios: store.scenarios,
  };
}

// ============================================================================
// Preset Names Export
// ============================================================================

export const PRESET_NAMES = Object.keys(presetScenarios) as PresetName[];

export default useScenarioStore;
