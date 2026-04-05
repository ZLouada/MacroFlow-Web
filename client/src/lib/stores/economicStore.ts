import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { useMemo } from 'react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface FiscalPolicy {
  taxRate: number; // 0-1 (percentage as decimal)
  governmentSpending: number; // G (in billions)
  transferPayments: number; // TR (in billions)
}

export interface MonetaryPolicy {
  moneySupply: number; // M (in billions)
  interestRate: number; // i (percentage as decimal)
  reserveRequirement: number; // RR (0-1)
  discountRate: number; // discount rate (percentage as decimal)
}

export interface ExternalSector {
  exchangeRate: number; // e (domestic currency per foreign currency)
  exchangeRateRegime: 'fixed' | 'floating';
  capitalMobility: 'perfect' | 'imperfect' | 'none'; // BP curve slope
  worldInterestRate: number; // i* (percentage as decimal)
  exports: number; // X (in billions)
  imports: number; // M (in billions)
  netCapitalFlow: number; // CF (in billions)
}

export interface EconomicIndicators {
  gdp: number; // Y (in billions)
  inflation: number; // π (percentage)
  unemployment: number; // u (percentage)
  priceLevel: number; // P (index, base = 100)
  potentialOutput: number; // Y* (in billions)
}

export interface ModelParameters {
  // IS Curve parameters
  autonomousConsumption: number; // C₀
  marginalPropensityConsume: number; // c (MPC)
  investmentSensitivity: number; // b (sensitivity to interest rate)
  autonomousInvestment: number; // I₀
  
  // LM Curve parameters
  moneyDemandIncomeSensitivity: number; // k
  moneyDemandInterestSensitivity: number; // h
  
  // BOP Curve parameters
  importPropensity: number; // m (marginal propensity to import)
  exportSensitivity: number; // sensitivity to exchange rate
  capitalFlowSensitivity: number; // sensitivity to interest rate differential
}

export interface SimulationState {
  isRunning: boolean;
  speed: number; // 1-10
  currentPeriod: number;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  period: number;
  timestamp: number;
  fiscalPolicy: FiscalPolicy;
  monetaryPolicy: MonetaryPolicy;
  externalSector: ExternalSector;
  indicators: EconomicIndicators;
}

export interface EconomicState {
  // Core economic state
  fiscalPolicy: FiscalPolicy;
  monetaryPolicy: MonetaryPolicy;
  externalSector: ExternalSector;
  indicators: EconomicIndicators;
  parameters: ModelParameters;
  simulation: SimulationState;
  
  // Actions - Fiscal Policy
  setTaxRate: (rate: number) => void;
  setGovernmentSpending: (spending: number) => void;
  setTransferPayments: (transfers: number) => void;
  updateFiscalPolicy: (policy: Partial<FiscalPolicy>) => void;
  
  // Actions - Monetary Policy
  setMoneySupply: (supply: number) => void;
  setInterestRate: (rate: number) => void;
  setReserveRequirement: (requirement: number) => void;
  setDiscountRate: (rate: number) => void;
  updateMonetaryPolicy: (policy: Partial<MonetaryPolicy>) => void;
  
  // Actions - External Sector
  setExchangeRate: (rate: number) => void;
  setExchangeRateRegime: (regime: 'fixed' | 'floating') => void;
  setCapitalMobility: (mobility: 'perfect' | 'imperfect' | 'none') => void;
  setWorldInterestRate: (rate: number) => void;
  updateExternalSector: (sector: Partial<ExternalSector>) => void;
  
  // Actions - Model Parameters
  updateParameters: (params: Partial<ModelParameters>) => void;
  resetParameters: () => void;
  
  // Actions - Simulation
  startSimulation: () => void;
  stopSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  
  // Actions - General
  recalculateEquilibrium: () => void;
  resetToDefaults: () => void;
  importState: (state: Partial<EconomicState>) => void;
  addToHistory: () => void;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

const defaultFiscalPolicy: FiscalPolicy = {
  taxRate: 0.25,
  governmentSpending: 500,
  transferPayments: 200,
};

const defaultMonetaryPolicy: MonetaryPolicy = {
  moneySupply: 1000,
  interestRate: 0.05,
  reserveRequirement: 0.1,
  discountRate: 0.03,
};

const defaultExternalSector: ExternalSector = {
  exchangeRate: 1.0,
  exchangeRateRegime: 'floating',
  capitalMobility: 'perfect',
  worldInterestRate: 0.04,
  exports: 300,
  imports: 280,
  netCapitalFlow: 0,
};

const defaultIndicators: EconomicIndicators = {
  gdp: 2000,
  inflation: 0.02,
  unemployment: 0.05,
  priceLevel: 100,
  potentialOutput: 2100,
};

const defaultParameters: ModelParameters = {
  autonomousConsumption: 200,
  marginalPropensityConsume: 0.75,
  investmentSensitivity: 1000,
  autonomousInvestment: 300,
  moneyDemandIncomeSensitivity: 0.5,
  moneyDemandInterestSensitivity: 2000,
  importPropensity: 0.2,
  exportSensitivity: 100,
  capitalFlowSensitivity: 500,
};

const defaultSimulation: SimulationState = {
  isRunning: false,
  speed: 5,
  currentPeriod: 0,
  history: [],
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useEconomicStore = create<EconomicState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial State
        fiscalPolicy: defaultFiscalPolicy,
        monetaryPolicy: defaultMonetaryPolicy,
        externalSector: defaultExternalSector,
        indicators: defaultIndicators,
        parameters: defaultParameters,
        simulation: defaultSimulation,

        // =================================================================
        // FISCAL POLICY ACTIONS
        // =================================================================

        setTaxRate: (rate) =>
          set(
            (state) => ({
              fiscalPolicy: { ...state.fiscalPolicy, taxRate: Math.max(0, Math.min(1, rate)) },
            }),
            false,
            'fiscalPolicy/setTaxRate'
          ),

        setGovernmentSpending: (spending) =>
          set(
            (state) => ({
              fiscalPolicy: { ...state.fiscalPolicy, governmentSpending: Math.max(0, spending) },
            }),
            false,
            'fiscalPolicy/setGovernmentSpending'
          ),

        setTransferPayments: (transfers) =>
          set(
            (state) => ({
              fiscalPolicy: { ...state.fiscalPolicy, transferPayments: Math.max(0, transfers) },
            }),
            false,
            'fiscalPolicy/setTransferPayments'
          ),

        updateFiscalPolicy: (policy) =>
          set(
            (state) => ({
              fiscalPolicy: { ...state.fiscalPolicy, ...policy },
            }),
            false,
            'fiscalPolicy/update'
          ),

        // =================================================================
        // MONETARY POLICY ACTIONS
        // =================================================================

        setMoneySupply: (supply) =>
          set(
            (state) => ({
              monetaryPolicy: { ...state.monetaryPolicy, moneySupply: Math.max(0, supply) },
            }),
            false,
            'monetaryPolicy/setMoneySupply'
          ),

        setInterestRate: (rate) =>
          set(
            (state) => ({
              monetaryPolicy: { ...state.monetaryPolicy, interestRate: Math.max(0, Math.min(1, rate)) },
            }),
            false,
            'monetaryPolicy/setInterestRate'
          ),

        setReserveRequirement: (requirement) =>
          set(
            (state) => ({
              monetaryPolicy: { ...state.monetaryPolicy, reserveRequirement: Math.max(0, Math.min(1, requirement)) },
            }),
            false,
            'monetaryPolicy/setReserveRequirement'
          ),

        setDiscountRate: (rate) =>
          set(
            (state) => ({
              monetaryPolicy: { ...state.monetaryPolicy, discountRate: Math.max(0, Math.min(1, rate)) },
            }),
            false,
            'monetaryPolicy/setDiscountRate'
          ),

        updateMonetaryPolicy: (policy) =>
          set(
            (state) => ({
              monetaryPolicy: { ...state.monetaryPolicy, ...policy },
            }),
            false,
            'monetaryPolicy/update'
          ),

        // =================================================================
        // EXTERNAL SECTOR ACTIONS
        // =================================================================

        setExchangeRate: (rate) =>
          set(
            (state) => ({
              externalSector: { ...state.externalSector, exchangeRate: Math.max(0.01, rate) },
            }),
            false,
            'externalSector/setExchangeRate'
          ),

        setExchangeRateRegime: (regime) =>
          set(
            (state) => ({
              externalSector: { ...state.externalSector, exchangeRateRegime: regime },
            }),
            false,
            'externalSector/setExchangeRateRegime'
          ),

        setCapitalMobility: (mobility) =>
          set(
            (state) => ({
              externalSector: { ...state.externalSector, capitalMobility: mobility },
            }),
            false,
            'externalSector/setCapitalMobility'
          ),

        setWorldInterestRate: (rate) =>
          set(
            (state) => ({
              externalSector: { ...state.externalSector, worldInterestRate: Math.max(0, Math.min(1, rate)) },
            }),
            false,
            'externalSector/setWorldInterestRate'
          ),

        updateExternalSector: (sector) =>
          set(
            (state) => ({
              externalSector: { ...state.externalSector, ...sector },
            }),
            false,
            'externalSector/update'
          ),

        // =================================================================
        // MODEL PARAMETERS ACTIONS
        // =================================================================

        updateParameters: (params) =>
          set(
            (state) => ({
              parameters: { ...state.parameters, ...params },
            }),
            false,
            'parameters/update'
          ),

        resetParameters: () =>
          set(
            { parameters: defaultParameters },
            false,
            'parameters/reset'
          ),

        // =================================================================
        // SIMULATION ACTIONS
        // =================================================================

        startSimulation: () =>
          set(
            (state) => ({
              simulation: { ...state.simulation, isRunning: true },
            }),
            false,
            'simulation/start'
          ),

        stopSimulation: () =>
          set(
            (state) => ({
              simulation: { ...state.simulation, isRunning: false },
            }),
            false,
            'simulation/stop'
          ),

        setSimulationSpeed: (speed) =>
          set(
            (state) => ({
              simulation: { ...state.simulation, speed: Math.max(1, Math.min(10, speed)) },
            }),
            false,
            'simulation/setSpeed'
          ),

        stepSimulation: () => {
          const state = get();
          state.addToHistory();
          set(
            (s) => ({
              simulation: { ...s.simulation, currentPeriod: s.simulation.currentPeriod + 1 },
            }),
            false,
            'simulation/step'
          );
          state.recalculateEquilibrium();
        },

        resetSimulation: () =>
          set(
            { simulation: defaultSimulation },
            false,
            'simulation/reset'
          ),

        // =================================================================
        // GENERAL ACTIONS
        // =================================================================

        recalculateEquilibrium: () => {
          const state = get();
          const { fiscalPolicy, monetaryPolicy, externalSector, parameters } = state;

          // Calculate multiplier
          const multiplier = 1 / (1 - parameters.marginalPropensityConsume * (1 - fiscalPolicy.taxRate) + parameters.importPropensity);

          // Calculate autonomous expenditure
          const autonomousExpenditure =
            parameters.autonomousConsumption +
            parameters.autonomousInvestment +
            fiscalPolicy.governmentSpending +
            externalSector.exports -
            parameters.investmentSensitivity * monetaryPolicy.interestRate;

          // Calculate equilibrium GDP (simplified IS-LM equilibrium)
          const equilibriumGDP = multiplier * autonomousExpenditure;

          // Calculate inflation based on output gap
          const outputGap = (equilibriumGDP - state.indicators.potentialOutput) / state.indicators.potentialOutput;
          const newInflation = state.indicators.inflation + 0.5 * outputGap;

          // Calculate unemployment using Okun's Law (simplified)
          const naturalUnemployment = 0.05;
          const newUnemployment = Math.max(0, naturalUnemployment - 0.5 * outputGap);

          // Calculate net exports (stored in externalSector for BOP calculations)
          const newImports = parameters.importPropensity * equilibriumGDP;

          // Calculate capital flows based on interest rate differential
          const interestDifferential = monetaryPolicy.interestRate - externalSector.worldInterestRate;
          const newCapitalFlow = parameters.capitalFlowSensitivity * interestDifferential;

          set(
            {
              indicators: {
                ...state.indicators,
                gdp: Math.max(0, equilibriumGDP),
                inflation: Math.max(-0.1, Math.min(0.5, newInflation)),
                unemployment: Math.max(0, Math.min(0.25, newUnemployment)),
              },
              externalSector: {
                ...state.externalSector,
                imports: Math.max(0, newImports),
                netCapitalFlow: newCapitalFlow,
              },
            },
            false,
            'indicators/recalculate'
          );
        },

        resetToDefaults: () =>
          set(
            {
              fiscalPolicy: defaultFiscalPolicy,
              monetaryPolicy: defaultMonetaryPolicy,
              externalSector: defaultExternalSector,
              indicators: defaultIndicators,
              parameters: defaultParameters,
              simulation: defaultSimulation,
            },
            false,
            'state/resetToDefaults'
          ),

        importState: (newState) =>
          set(
            (state) => ({
              ...state,
              ...newState,
            }),
            false,
            'state/import'
          ),

        addToHistory: () =>
          set(
            (state) => ({
              simulation: {
                ...state.simulation,
                history: [
                  ...state.simulation.history.slice(-99), // Keep last 100 entries
                  {
                    period: state.simulation.currentPeriod,
                    timestamp: Date.now(),
                    fiscalPolicy: { ...state.fiscalPolicy },
                    monetaryPolicy: { ...state.monetaryPolicy },
                    externalSector: { ...state.externalSector },
                    indicators: { ...state.indicators },
                  },
                ],
              },
            }),
            false,
            'history/add'
          ),
      })),
      {
        name: 'macroflow-economic-state',
        partialize: (state) => ({
          fiscalPolicy: state.fiscalPolicy,
          monetaryPolicy: state.monetaryPolicy,
          externalSector: state.externalSector,
          parameters: state.parameters,
        }),
      }
    ),
    { name: 'EconomicStore' }
  )
);

// =============================================================================
// MEMOIZED SELECTORS
// =============================================================================

// Selector for fiscal policy with shallow comparison
export const useFiscalPolicy = () =>
  useEconomicStore((state) => state.fiscalPolicy, shallow);

// Selector for monetary policy with shallow comparison
export const useMonetaryPolicy = () =>
  useEconomicStore((state) => state.monetaryPolicy, shallow);

// Selector for external sector with shallow comparison
export const useExternalSector = () =>
  useEconomicStore((state) => state.externalSector, shallow);

// Selector for economic indicators with shallow comparison
export const useEconomicIndicators = () =>
  useEconomicStore((state) => state.indicators, shallow);

// Selector for model parameters with shallow comparison
export const useModelParameters = () =>
  useEconomicStore((state) => state.parameters, shallow);

// Selector for simulation state with shallow comparison
export const useSimulationState = () =>
  useEconomicStore((state) => state.simulation, shallow);

// Computed selector for budget deficit
export const useBudgetDeficit = () => {
  const fiscalPolicy = useFiscalPolicy();
  const indicators = useEconomicIndicators();
  
  return useMemo(() => {
    const taxRevenue = fiscalPolicy.taxRate * indicators.gdp;
    return fiscalPolicy.governmentSpending + fiscalPolicy.transferPayments - taxRevenue;
  }, [fiscalPolicy, indicators.gdp]);
};

// Computed selector for trade balance
export const useTradeBalance = () => {
  const externalSector = useExternalSector();
  
  return useMemo(() => {
    return externalSector.exports - externalSector.imports;
  }, [externalSector.exports, externalSector.imports]);
};

// Computed selector for balance of payments
export const useBalanceOfPayments = () => {
  const tradeBalance = useTradeBalance();
  const externalSector = useExternalSector();
  
  return useMemo(() => {
    return tradeBalance + externalSector.netCapitalFlow;
  }, [tradeBalance, externalSector.netCapitalFlow]);
};

// Selector for all actions (doesn't cause re-renders)
export const useEconomicActions = () =>
  useEconomicStore(
    (state) => ({
      setTaxRate: state.setTaxRate,
      setGovernmentSpending: state.setGovernmentSpending,
      setTransferPayments: state.setTransferPayments,
      updateFiscalPolicy: state.updateFiscalPolicy,
      setMoneySupply: state.setMoneySupply,
      setInterestRate: state.setInterestRate,
      setReserveRequirement: state.setReserveRequirement,
      setDiscountRate: state.setDiscountRate,
      updateMonetaryPolicy: state.updateMonetaryPolicy,
      setExchangeRate: state.setExchangeRate,
      setExchangeRateRegime: state.setExchangeRateRegime,
      setCapitalMobility: state.setCapitalMobility,
      setWorldInterestRate: state.setWorldInterestRate,
      updateExternalSector: state.updateExternalSector,
      updateParameters: state.updateParameters,
      resetParameters: state.resetParameters,
      startSimulation: state.startSimulation,
      stopSimulation: state.stopSimulation,
      setSimulationSpeed: state.setSimulationSpeed,
      stepSimulation: state.stepSimulation,
      resetSimulation: state.resetSimulation,
      recalculateEquilibrium: state.recalculateEquilibrium,
      resetToDefaults: state.resetToDefaults,
      importState: state.importState,
      addToHistory: state.addToHistory,
    }),
    shallow
  );
