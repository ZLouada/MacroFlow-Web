import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import {
  calculateISLMEquilibrium,
  type ISCurveParams,
  type LMCurveParams,
  type BOPCurveParams,
} from '@/lib/economics/mundellFleming';

// ============================================================================
// Types
// ============================================================================

export type CapitalMobility = 'perfect' | 'imperfect' | 'none';

export interface CountryParameters {
  is: ISCurveParams;
  lm: LMCurveParams;
  bop: BOPCurveParams;
}

export interface CountryEconomy {
  id: string;
  name: string;
  code: string;
  flag: string;
  
  fiscalPolicy: {
    governmentSpending: number;
    taxRate: number;
    transferPayments: number;
  };
  
  monetaryPolicy: {
    moneySupply: number;
    interestRate: number;
  };
  
  externalSector: {
    exchangeRate: number;
    exchangeRateRegime: 'fixed' | 'floating';
    capitalMobility: CapitalMobility;
  };
  
  parameters: CountryParameters;
  
  equilibrium: {
    Y: number;
    r: number;
    tradeBalance: number;
    capitalFlow: number;
    bop: number;
  };
  
  tradePartners: Record<string, number>;
}

export interface SpilloverEffect {
  sourceCountry: string;
  targetCountry: string;
  channel: 'trade' | 'financial' | 'both';
  magnitude: number;
  description: string;
}

export interface MultiCountryState {
  countries: Record<string, CountryEconomy>;
  activeCountryId: string | null;
  comparisonCountryId: string | null;
  spillovers: SpilloverEffect[];
  isCalculating: boolean;
  
  syncSettings: {
    autoRecalculate: boolean;
    showSpillovers: boolean;
    tradeElasticity: number;
    financialIntegration: number;
  };
  
  addCountry: (country: Omit<CountryEconomy, 'equilibrium'>) => void;
  removeCountry: (countryId: string) => void;
  updateCountry: (countryId: string, updates: Partial<CountryEconomy>) => void;
  setActiveCountry: (countryId: string | null) => void;
  setComparisonCountry: (countryId: string | null) => void;
  
  setFiscalPolicy: (countryId: string, policy: Partial<CountryEconomy['fiscalPolicy']>) => void;
  setMonetaryPolicy: (countryId: string, policy: Partial<CountryEconomy['monetaryPolicy']>) => void;
  setExternalSector: (countryId: string, sector: Partial<CountryEconomy['externalSector']>) => void;
  
  calculateEquilibrium: (countryId: string) => void;
  calculateAllEquilibria: () => void;
  calculateSpillovers: () => void;
  
  updateSyncSettings: (settings: Partial<MultiCountryState['syncSettings']>) => void;
  loadTwoCountryPreset: (preset: TwoCountryPresetName) => void;
  resetToDefaults: () => void;
}

export type TwoCountryPresetName = 
  | 'us_eu'
  | 'us_china'
  | 'eu_uk'
  | 'emerging_advanced'
  | 'symmetric';

// ============================================================================
// Default Values
// ============================================================================

const createDefaultISParams = (): ISCurveParams => ({
  autonomousConsumption: 200,
  marginalPropensityConsume: 0.75,
  taxRate: 0.25,
  autonomousInvestment: 300,
  investmentSensitivity: 1000,
  governmentSpending: 500,
  exports: 300,
  importPropensity: 0.2,
});

const createDefaultLMParams = (): LMCurveParams => ({
  moneySupply: 1000,
  priceLevel: 1.0,
  moneyDemandIncomeSensitivity: 0.5,
  moneyDemandInterestSensitivity: 2000,
});

const createDefaultBOPParams = (): BOPCurveParams => ({
  worldInterestRate: 0.04,
  exports: 300,
  importPropensity: 0.2,
  capitalFlowSensitivity: 500,
  capitalMobility: 'perfect',
});

const createDefaultCountry = (
  id: string,
  name: string,
  code: string,
  flag: string
): CountryEconomy => ({
  id,
  name,
  code,
  flag,
  fiscalPolicy: {
    governmentSpending: 500,
    taxRate: 0.25,
    transferPayments: 200,
  },
  monetaryPolicy: {
    moneySupply: 1000,
    interestRate: 0.05,
  },
  externalSector: {
    exchangeRate: 1.0,
    exchangeRateRegime: 'floating',
    capitalMobility: 'perfect',
  },
  parameters: {
    is: createDefaultISParams(),
    lm: createDefaultLMParams(),
    bop: createDefaultBOPParams(),
  },
  equilibrium: {
    Y: 2000,
    r: 0.05,
    tradeBalance: 0,
    capitalFlow: 0,
    bop: 0,
  },
  tradePartners: {},
});

// ============================================================================
// Two-Country Presets
// ============================================================================

const twoCountryPresets: Record<TwoCountryPresetName, { home: Omit<CountryEconomy, 'equilibrium'>; foreign: Omit<CountryEconomy, 'equilibrium'> }> = {
  us_eu: {
    home: {
      ...createDefaultCountry('us', 'United States', 'US', '🇺🇸'),
      fiscalPolicy: { governmentSpending: 600, taxRate: 0.22, transferPayments: 250 },
      monetaryPolicy: { moneySupply: 1200, interestRate: 0.05 },
      tradePartners: { eu: 0.08 },
    },
    foreign: {
      ...createDefaultCountry('eu', 'European Union', 'EU', '🇪🇺'),
      fiscalPolicy: { governmentSpending: 550, taxRate: 0.35, transferPayments: 300 },
      monetaryPolicy: { moneySupply: 1100, interestRate: 0.04 },
      tradePartners: { us: 0.10 },
    },
  },
  
  us_china: {
    home: {
      ...createDefaultCountry('us', 'United States', 'US', '🇺🇸'),
      fiscalPolicy: { governmentSpending: 600, taxRate: 0.22, transferPayments: 250 },
      monetaryPolicy: { moneySupply: 1200, interestRate: 0.05 },
      tradePartners: { china: 0.12 },
    },
    foreign: {
      ...createDefaultCountry('china', 'China', 'CN', '🇨🇳'),
      fiscalPolicy: { governmentSpending: 700, taxRate: 0.20, transferPayments: 150 },
      monetaryPolicy: { moneySupply: 1500, interestRate: 0.04 },
      externalSector: { exchangeRate: 7.2, exchangeRateRegime: 'fixed', capitalMobility: 'imperfect' },
      tradePartners: { us: 0.15 },
    },
  },
  
  eu_uk: {
    home: {
      ...createDefaultCountry('eu', 'European Union', 'EU', '🇪🇺'),
      fiscalPolicy: { governmentSpending: 550, taxRate: 0.35, transferPayments: 300 },
      monetaryPolicy: { moneySupply: 1100, interestRate: 0.04 },
      tradePartners: { uk: 0.12 },
    },
    foreign: {
      ...createDefaultCountry('uk', 'United Kingdom', 'GB', '🇬🇧'),
      fiscalPolicy: { governmentSpending: 480, taxRate: 0.30, transferPayments: 200 },
      monetaryPolicy: { moneySupply: 900, interestRate: 0.05 },
      tradePartners: { eu: 0.20 },
    },
  },
  
  emerging_advanced: {
    home: {
      ...createDefaultCountry('advanced', 'Advanced Economy', 'ADV', '🏛️'),
      fiscalPolicy: { governmentSpending: 500, taxRate: 0.30, transferPayments: 250 },
      monetaryPolicy: { moneySupply: 1000, interestRate: 0.03 },
      tradePartners: { emerging: 0.10 },
    },
    foreign: {
      ...createDefaultCountry('emerging', 'Emerging Market', 'EMG', '🌱'),
      fiscalPolicy: { governmentSpending: 300, taxRate: 0.20, transferPayments: 100 },
      monetaryPolicy: { moneySupply: 600, interestRate: 0.08 },
      externalSector: { exchangeRate: 15.0, exchangeRateRegime: 'floating', capitalMobility: 'imperfect' },
      tradePartners: { advanced: 0.25 },
    },
  },
  
  symmetric: {
    home: {
      ...createDefaultCountry('home', 'Home Country', 'HOM', '🏠'),
      tradePartners: { foreign: 0.15 },
    },
    foreign: {
      ...createDefaultCountry('foreign', 'Foreign Country', 'FOR', '🌍'),
      tradePartners: { home: 0.15 },
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculateCountryEquilibrium(country: CountryEconomy | Omit<CountryEconomy, 'equilibrium'>): CountryEconomy['equilibrium'] {
  const { parameters, externalSector } = country;
  
  // Calculate IS-LM equilibrium
  const result = calculateISLMEquilibrium(parameters.is, parameters.lm);
  
  // Calculate trade balance
  const tradeBalance = parameters.is.exports - parameters.is.importPropensity * result.Y;
  
  // Calculate capital flow based on interest differential
  const rDiff = result.i - parameters.bop.worldInterestRate;
  let capitalFlow = 0;
  
  switch (externalSector.capitalMobility) {
    case 'perfect':
      capitalFlow = rDiff * 10000;
      break;
    case 'imperfect':
      capitalFlow = rDiff * parameters.bop.capitalFlowSensitivity;
      break;
    case 'none':
      capitalFlow = 0;
      break;
  }

  return {
    Y: result.Y,
    r: result.i,
    tradeBalance,
    capitalFlow,
    bop: tradeBalance + capitalFlow,
  };
}

function calculateAllSpillovers(
  countries: Record<string, CountryEconomy>,
  settings: MultiCountryState['syncSettings']
): SpilloverEffect[] {
  const spillovers: SpilloverEffect[] = [];
  const countryIds = Object.keys(countries);

  for (const sourceId of countryIds) {
    for (const targetId of countryIds) {
      if (sourceId === targetId) continue;

      const source = countries[sourceId];
      const target = countries[targetId];
      
      const bilateralPropensity = source.tradePartners[targetId] || 0;
      if (bilateralPropensity > 0) {
        const tradeMagnitude = bilateralPropensity * source.equilibrium.Y * settings.tradeElasticity / 1000;
        
        spillovers.push({
          sourceCountry: sourceId,
          targetCountry: targetId,
          channel: 'trade',
          magnitude: tradeMagnitude,
          description: `${source.name}'s demand increases ${target.name}'s exports by ${tradeMagnitude.toFixed(1)}B`,
        });
      }

      if (settings.financialIntegration > 0) {
        const rDiff = source.monetaryPolicy.interestRate - target.monetaryPolicy.interestRate;
        const financialMagnitude = rDiff * settings.financialIntegration * 1000;
        
        if (Math.abs(financialMagnitude) > 10) {
          spillovers.push({
            sourceCountry: sourceId,
            targetCountry: targetId,
            channel: 'financial',
            magnitude: financialMagnitude,
            description: financialMagnitude > 0
              ? `Capital flows from ${target.name} to ${source.name} (${Math.abs(financialMagnitude).toFixed(1)}B)`
              : `Capital flows from ${source.name} to ${target.name} (${Math.abs(financialMagnitude).toFixed(1)}B)`,
          });
        }
      }
    }
  }

  return spillovers;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useMultiCountryStore = create<MultiCountryState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      countries: {},
      activeCountryId: null,
      comparisonCountryId: null,
      spillovers: [],
      isCalculating: false,
      syncSettings: {
        autoRecalculate: true,
        showSpillovers: true,
        tradeElasticity: 1.0,
        financialIntegration: 0.8,
      },

      addCountry: (country) => {
        const equilibrium = calculateCountryEquilibrium(country);
        set((state) => ({
          countries: {
            ...state.countries,
            [country.id]: { ...country, equilibrium } as CountryEconomy,
          },
        }));
      },

      removeCountry: (countryId) => {
        set((state) => {
          const { [countryId]: _, ...remaining } = state.countries;
          return {
            countries: remaining,
            activeCountryId: state.activeCountryId === countryId ? null : state.activeCountryId,
            comparisonCountryId: state.comparisonCountryId === countryId ? null : state.comparisonCountryId,
          };
        });
      },

      updateCountry: (countryId, updates) => {
        set((state) => ({
          countries: {
            ...state.countries,
            [countryId]: {
              ...state.countries[countryId],
              ...updates,
            },
          },
        }));
        
        if (get().syncSettings.autoRecalculate) {
          get().calculateEquilibrium(countryId);
          get().calculateSpillovers();
        }
      },

      setActiveCountry: (countryId) => {
        set({ activeCountryId: countryId });
      },

      setComparisonCountry: (countryId) => {
        set({ comparisonCountryId: countryId });
      },

      setFiscalPolicy: (countryId, policy) => {
        const state = get();
        const country = state.countries[countryId];
        if (!country) return;

        const newFiscal = { ...country.fiscalPolicy, ...policy };
        const newIS: ISCurveParams = {
          ...country.parameters.is,
          governmentSpending: newFiscal.governmentSpending,
          taxRate: newFiscal.taxRate,
        };

        set((s) => ({
          countries: {
            ...s.countries,
            [countryId]: {
              ...country,
              fiscalPolicy: newFiscal,
              parameters: { ...country.parameters, is: newIS },
            },
          },
        }));

        if (state.syncSettings.autoRecalculate) {
          get().calculateAllEquilibria();
        }
      },

      setMonetaryPolicy: (countryId, policy) => {
        const state = get();
        const country = state.countries[countryId];
        if (!country) return;

        const newMonetary = { ...country.monetaryPolicy, ...policy };
        const newLM: LMCurveParams = {
          ...country.parameters.lm,
          moneySupply: newMonetary.moneySupply,
        };

        set((s) => ({
          countries: {
            ...s.countries,
            [countryId]: {
              ...country,
              monetaryPolicy: newMonetary,
              parameters: { ...country.parameters, lm: newLM },
            },
          },
        }));

        if (state.syncSettings.autoRecalculate) {
          get().calculateAllEquilibria();
        }
      },

      setExternalSector: (countryId, sector) => {
        const state = get();
        const country = state.countries[countryId];
        if (!country) return;

        const newExternal = { ...country.externalSector, ...sector };
        const newBOP: BOPCurveParams = {
          ...country.parameters.bop,
          capitalMobility: newExternal.capitalMobility,
        };

        set((s) => ({
          countries: {
            ...s.countries,
            [countryId]: {
              ...country,
              externalSector: newExternal,
              parameters: { ...country.parameters, bop: newBOP },
            },
          },
        }));

        if (state.syncSettings.autoRecalculate) {
          get().calculateAllEquilibria();
        }
      },

      calculateEquilibrium: (countryId) => {
        const state = get();
        const country = state.countries[countryId];
        if (!country) return;

        const equilibrium = calculateCountryEquilibrium(country);

        set((s) => ({
          countries: {
            ...s.countries,
            [countryId]: {
              ...country,
              equilibrium,
            },
          },
        }));
      },

      calculateAllEquilibria: () => {
        const state = get();
        set({ isCalculating: true });

        const updatedCountries = { ...state.countries };
        
        Object.keys(updatedCountries).forEach((countryId) => {
          const equilibrium = calculateCountryEquilibrium(updatedCountries[countryId]);
          updatedCountries[countryId] = {
            ...updatedCountries[countryId],
            equilibrium,
          };
        });

        const spillovers = calculateAllSpillovers(updatedCountries, state.syncSettings);

        set({
          countries: updatedCountries,
          spillovers,
          isCalculating: false,
        });
      },

      calculateSpillovers: () => {
        const state = get();
        const spillovers = calculateAllSpillovers(state.countries, state.syncSettings);
        set({ spillovers });
      },

      updateSyncSettings: (settings) => {
        set((state) => ({
          syncSettings: { ...state.syncSettings, ...settings },
        }));
      },

      loadTwoCountryPreset: (preset) => {
        const presetData = twoCountryPresets[preset];
        if (!presetData) return;

        const homeEquilibrium = calculateCountryEquilibrium(presetData.home);
        const foreignEquilibrium = calculateCountryEquilibrium(presetData.foreign);

        set({
          countries: {
            [presetData.home.id]: { ...presetData.home, equilibrium: homeEquilibrium } as CountryEconomy,
            [presetData.foreign.id]: { ...presetData.foreign, equilibrium: foreignEquilibrium } as CountryEconomy,
          },
          activeCountryId: presetData.home.id,
          comparisonCountryId: presetData.foreign.id,
        });

        get().calculateSpillovers();
      },

      resetToDefaults: () => {
        set({
          countries: {},
          activeCountryId: null,
          comparisonCountryId: null,
          spillovers: [],
        });
      },
    })),
    { name: 'MultiCountryStore' }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const useActiveCountry = () =>
  useMultiCountryStore((state) => {
    const id = state.activeCountryId;
    return id ? state.countries[id] : null;
  });

export const useComparisonCountry = () =>
  useMultiCountryStore((state) => {
    const id = state.comparisonCountryId;
    return id ? state.countries[id] : null;
  });

export const useCountryList = () =>
  useMultiCountryStore((state) => Object.values(state.countries), shallow);

export const useSpillovers = () =>
  useMultiCountryStore((state) => state.spillovers, shallow);

export const useMultiCountryActions = () =>
  useMultiCountryStore(
    (state) => ({
      addCountry: state.addCountry,
      removeCountry: state.removeCountry,
      updateCountry: state.updateCountry,
      setActiveCountry: state.setActiveCountry,
      setComparisonCountry: state.setComparisonCountry,
      setFiscalPolicy: state.setFiscalPolicy,
      setMonetaryPolicy: state.setMonetaryPolicy,
      setExternalSector: state.setExternalSector,
      calculateEquilibrium: state.calculateEquilibrium,
      calculateAllEquilibria: state.calculateAllEquilibria,
      calculateSpillovers: state.calculateSpillovers,
      updateSyncSettings: state.updateSyncSettings,
      loadTwoCountryPreset: state.loadTwoCountryPreset,
      resetToDefaults: state.resetToDefaults,
    }),
    shallow
  );

export default useMultiCountryStore;
