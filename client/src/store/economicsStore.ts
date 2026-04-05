import { create } from 'zustand';

// Define the core macroeconomic variables used in the Mundell-Fleming model
export interface MacroVariables {
  taxRate: number;
  governmentSpending: number;
  moneySupply: number;
  // Phase 2 variables like exchangeRate will be added later
}

interface EconomicsState {
  // Heavy computation state (Core variables that trigger equilibrium recalculations)
  core: MacroVariables;
  // Lightweight UI state (Used for smooth slider dragging without lag)
  visual: MacroVariables;
  
  // Actions
  // 1. Update lightweight state instantly (call onSliderChange)
  setVisualParam: (key: keyof MacroVariables, value: number) => void;
  // 2. Commit visual state to core state (call onDragEnd)
  commitParams: () => void;
  // 3. Directly update both if bypassing slider (e.g., direct number input)
  setCoreParam: (key: keyof MacroVariables, value: number) => void;
}

const initialVariables: MacroVariables = {
  taxRate: 0.2, // 20%
  governmentSpending: 1000, // in billions
  moneySupply: 5000,
};

export const useEconomicsStore = create<EconomicsState>((set) => ({
  core: initialVariables,
  visual: initialVariables,
  
  setVisualParam: (key, value) => 
    set((state) => ({
      visual: { 
        ...state.visual, 
        [key]: value 
      }
    })),
    
  commitParams: () => 
    set((state) => {
      // Phase 2 Note: This is where we will trigger the heavy
      // Mundell-Fleming (IS-LM-BOP) equilibrium recalculation
      // because 'core' state is being updated.
      return {
        core: { ...state.visual }
      };
    }),
    
  setCoreParam: (key, value) => 
    set((state) => ({
      core: { 
        ...state.core, 
        [key]: value 
      },
      visual: { 
        ...state.visual, 
        [key]: value 
      }
    }))
}));
