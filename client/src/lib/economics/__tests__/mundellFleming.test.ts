import { describe, it, expect } from 'vitest';
import {
  calculateISCurve,
  calculateLMCurve,
  calculateBOPCurve,
  calculateISLMEquilibrium,
  calculateMundellFlemingEquilibrium,
  getISIncomeAtInterestRate,
  getISInterestRateAtIncome,
  getLMIncomeAtInterestRate,
  getLMInterestRateAtIncome,
  getBOPIncomeAtInterestRate,
  generateChartData,
  generateCurveDataSets,
  analyzeFiscalPolicyImpact,
  analyzeMonetaryPolicyImpact,
  calculateFiscalMultiplier,
  calculateMonetaryMultiplier,
  type ISCurveParams,
  type LMCurveParams,
  type BOPCurveParams,
} from '../mundellFleming';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const defaultISParams: ISCurveParams = {
  autonomousConsumption: 200,
  marginalPropensityConsume: 0.75,
  taxRate: 0.25,
  autonomousInvestment: 300,
  investmentSensitivity: 1000,
  governmentSpending: 500,
  exports: 300,
  importPropensity: 0.2,
};

const defaultLMParams: LMCurveParams = {
  moneySupply: 1000,
  priceLevel: 100,
  moneyDemandIncomeSensitivity: 0.5,
  moneyDemandInterestSensitivity: 2000,
};

const defaultBOPParams: BOPCurveParams = {
  worldInterestRate: 0.04,
  exports: 300,
  importPropensity: 0.2,
  capitalFlowSensitivity: 500,
  capitalMobility: 'imperfect',
};

// =============================================================================
// IS CURVE TESTS
// =============================================================================

describe('IS Curve Functions', () => {
  describe('calculateISCurve', () => {
    it('should return an array of points', () => {
      const points = calculateISCurve(defaultISParams);
      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
    });

    it('should return points with x (income) and y (interest rate) properties', () => {
      const points = calculateISCurve(defaultISParams);
      points.forEach(point => {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });

    it('should have negative slope (higher income -> lower interest rate)', () => {
      const points = calculateISCurve(defaultISParams);
      // Filter points with positive interest rates
      const validPoints = points.filter(p => p.y >= 0);
      
      if (validPoints.length >= 2) {
        const first = validPoints[0];
        const last = validPoints[validPoints.length - 1];
        // IS curve slopes downward: as Y increases, i decreases
        expect(first.x).toBeLessThan(last.x); // Income increases
        expect(first.y).toBeGreaterThan(last.y); // Interest rate decreases
      }
    });

    it('should respect numPoints parameter', () => {
      const points = calculateISCurve(defaultISParams, 0, 2000, 50);
      expect(points.length).toBeLessThanOrEqual(50);
    });

    it('should only include points with non-negative interest rates', () => {
      const points = calculateISCurve(defaultISParams);
      points.forEach(point => {
        expect(point.y).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getISIncomeAtInterestRate', () => {
    it('should return a positive income for reasonable interest rates', () => {
      const income = getISIncomeAtInterestRate(defaultISParams, 0.05);
      expect(income).toBeGreaterThan(0);
    });

    it('should return higher income at lower interest rates', () => {
      const incomeAtLowRate = getISIncomeAtInterestRate(defaultISParams, 0.02);
      const incomeAtHighRate = getISIncomeAtInterestRate(defaultISParams, 0.08);
      expect(incomeAtLowRate).toBeGreaterThan(incomeAtHighRate);
    });

    it('should be inverse of getISInterestRateAtIncome', () => {
      const interestRate = 0.05;
      const income = getISIncomeAtInterestRate(defaultISParams, interestRate);
      const recoveredRate = getISInterestRateAtIncome(defaultISParams, income);
      expect(recoveredRate).toBeCloseTo(interestRate, 5);
    });
  });

  describe('getISInterestRateAtIncome', () => {
    it('should return a non-negative interest rate for reasonable income', () => {
      const rate = getISInterestRateAtIncome(defaultISParams, 2000);
      expect(rate).toBeGreaterThanOrEqual(0);
    });
  });
});

// =============================================================================
// LM CURVE TESTS
// =============================================================================

describe('LM Curve Functions', () => {
  describe('calculateLMCurve', () => {
    it('should return an array of points', () => {
      const points = calculateLMCurve(defaultLMParams);
      expect(Array.isArray(points)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
    });

    it('should have positive slope (higher income -> higher interest rate)', () => {
      const points = calculateLMCurve(defaultLMParams);
      const validPoints = points.filter(p => p.y >= 0);
      
      if (validPoints.length >= 2) {
        const first = validPoints[0];
        const last = validPoints[validPoints.length - 1];
        // LM curve slopes upward: as Y increases, i increases
        expect(last.x).toBeGreaterThan(first.x);
        expect(last.y).toBeGreaterThan(first.y);
      }
    });

    it('should only include points with non-negative interest rates', () => {
      const points = calculateLMCurve(defaultLMParams);
      points.forEach(point => {
        expect(point.y).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getLMIncomeAtInterestRate', () => {
    it('should return a positive income for positive interest rates', () => {
      const income = getLMIncomeAtInterestRate(defaultLMParams, 0.05);
      expect(income).toBeGreaterThan(0);
    });

    it('should return higher income at higher interest rates', () => {
      const incomeAtLowRate = getLMIncomeAtInterestRate(defaultLMParams, 0.02);
      const incomeAtHighRate = getLMIncomeAtInterestRate(defaultLMParams, 0.08);
      expect(incomeAtHighRate).toBeGreaterThan(incomeAtLowRate);
    });
  });

  describe('getLMInterestRateAtIncome', () => {
    it('should be inverse of getLMIncomeAtInterestRate', () => {
      const income = 2000;
      const rate = getLMInterestRateAtIncome(defaultLMParams, income);
      const recoveredIncome = getLMIncomeAtInterestRate(defaultLMParams, rate);
      expect(recoveredIncome).toBeCloseTo(income, 5);
    });
  });

  describe('Money Supply Effects', () => {
    it('should shift LM curve down with higher money supply', () => {
      const baseLM = defaultLMParams;
      const higherMSLM = { ...baseLM, moneySupply: 1500 };
      
      const baseRate = getLMInterestRateAtIncome(baseLM, 2000);
      const higherMSRate = getLMInterestRateAtIncome(higherMSLM, 2000);
      
      // Higher money supply -> lower interest rate at same income
      expect(higherMSRate).toBeLessThan(baseRate);
    });
  });
});

// =============================================================================
// BOP CURVE TESTS
// =============================================================================

describe('BOP Curve Functions', () => {
  describe('calculateBOPCurve - Perfect Capital Mobility', () => {
    it('should return a horizontal line at world interest rate', () => {
      const perfectMobilityParams: BOPCurveParams = {
        ...defaultBOPParams,
        capitalMobility: 'perfect',
      };
      
      const points = calculateBOPCurve(perfectMobilityParams);
      
      points.forEach(point => {
        expect(point.y).toBeCloseTo(perfectMobilityParams.worldInterestRate, 5);
      });
    });
  });

  describe('calculateBOPCurve - No Capital Mobility', () => {
    it('should return a vertical line', () => {
      const noMobilityParams: BOPCurveParams = {
        ...defaultBOPParams,
        capitalMobility: 'none',
      };
      
      const points = calculateBOPCurve(noMobilityParams);
      const expectedIncome = noMobilityParams.exports / noMobilityParams.importPropensity;
      
      points.forEach(point => {
        expect(point.x).toBeCloseTo(expectedIncome, 5);
      });
    });
  });

  describe('calculateBOPCurve - Imperfect Capital Mobility', () => {
    it('should have positive slope', () => {
      const points = calculateBOPCurve(defaultBOPParams);
      const validPoints = points.filter(p => p.y >= 0);
      
      if (validPoints.length >= 2) {
        const first = validPoints[0];
        const last = validPoints[validPoints.length - 1];
        // BOP curve slopes upward with imperfect mobility
        if (last.x > first.x) {
          expect(last.y).toBeGreaterThanOrEqual(first.y);
        }
      }
    });
  });

  describe('getBOPIncomeAtInterestRate', () => {
    it('should return Infinity for perfect capital mobility', () => {
      const perfectMobility: BOPCurveParams = {
        ...defaultBOPParams,
        capitalMobility: 'perfect',
      };
      const income = getBOPIncomeAtInterestRate(perfectMobility, 0.05);
      expect(income).toBe(Infinity);
    });

    it('should return fixed income for no capital mobility', () => {
      const noMobility: BOPCurveParams = {
        ...defaultBOPParams,
        capitalMobility: 'none',
      };
      const income = getBOPIncomeAtInterestRate(noMobility, 0.05);
      const expectedIncome = noMobility.exports / noMobility.importPropensity;
      expect(income).toBeCloseTo(expectedIncome, 5);
    });
  });
});

// =============================================================================
// EQUILIBRIUM TESTS
// =============================================================================

describe('Equilibrium Calculations', () => {
  describe('calculateISLMEquilibrium', () => {
    it('should return valid equilibrium with positive values', () => {
      const equilibrium = calculateISLMEquilibrium(defaultISParams, defaultLMParams);
      
      expect(equilibrium.Y).toBeGreaterThan(0);
      expect(equilibrium.i).toBeGreaterThanOrEqual(0);
      expect(equilibrium.isValid).toBe(true);
    });

    it('should lie on both IS and LM curves', () => {
      const equilibrium = calculateISLMEquilibrium(defaultISParams, defaultLMParams);
      
      // Check that equilibrium point lies on IS curve
      const isInterestRate = getISInterestRateAtIncome(defaultISParams, equilibrium.Y);
      expect(isInterestRate).toBeCloseTo(equilibrium.i, 4);
      
      // Check that equilibrium point lies on LM curve
      const lmInterestRate = getLMInterestRateAtIncome(defaultLMParams, equilibrium.Y);
      expect(lmInterestRate).toBeCloseTo(equilibrium.i, 4);
    });

    it('should respond to fiscal expansion', () => {
      const baseEquilibrium = calculateISLMEquilibrium(defaultISParams, defaultLMParams);
      
      const expansionaryFiscal = {
        ...defaultISParams,
        governmentSpending: defaultISParams.governmentSpending + 100,
      };
      const newEquilibrium = calculateISLMEquilibrium(expansionaryFiscal, defaultLMParams);
      
      // Fiscal expansion -> higher Y and higher i
      expect(newEquilibrium.Y).toBeGreaterThan(baseEquilibrium.Y);
      expect(newEquilibrium.i).toBeGreaterThan(baseEquilibrium.i);
    });

    it('should respond to monetary expansion', () => {
      const baseEquilibrium = calculateISLMEquilibrium(defaultISParams, defaultLMParams);
      
      const expansionaryMonetary = {
        ...defaultLMParams,
        moneySupply: defaultLMParams.moneySupply + 500,
      };
      const newEquilibrium = calculateISLMEquilibrium(defaultISParams, expansionaryMonetary);
      
      // Monetary expansion -> higher Y and lower i
      expect(newEquilibrium.Y).toBeGreaterThan(baseEquilibrium.Y);
      expect(newEquilibrium.i).toBeLessThan(baseEquilibrium.i);
    });
  });

  describe('calculateMundellFlemingEquilibrium', () => {
    it('should return valid equilibrium', () => {
      const equilibrium = calculateMundellFlemingEquilibrium(
        defaultISParams,
        defaultLMParams,
        defaultBOPParams,
        'floating'
      );
      
      expect(equilibrium.Y).toBeGreaterThan(0);
      expect(equilibrium.isValid).toBe(true);
    });

    it('should fix interest rate at world rate with perfect capital mobility and fixed exchange rate', () => {
      const perfectMobility: BOPCurveParams = {
        ...defaultBOPParams,
        capitalMobility: 'perfect',
      };
      
      const equilibrium = calculateMundellFlemingEquilibrium(
        defaultISParams,
        defaultLMParams,
        perfectMobility,
        'fixed'
      );
      
      expect(equilibrium.i).toBeCloseTo(perfectMobility.worldInterestRate, 5);
      expect(equilibrium.adjustedMoneySupply).toBeDefined();
    });
  });
});

// =============================================================================
// POLICY ANALYSIS TESTS
// =============================================================================

describe('Policy Analysis', () => {
  describe('analyzeFiscalPolicyImpact', () => {
    it('should show positive impact from expansionary fiscal policy', () => {
      const impact = analyzeFiscalPolicyImpact(defaultISParams, defaultLMParams, 100);
      
      expect(impact.deltaY).toBeGreaterThan(0);
      expect(impact.deltaI).toBeGreaterThan(0);
      expect(impact.multiplier).toBeGreaterThan(0);
    });

    it('should show negative impact from contractionary fiscal policy', () => {
      const impact = analyzeFiscalPolicyImpact(defaultISParams, defaultLMParams, -100);
      
      expect(impact.deltaY).toBeLessThan(0);
      expect(impact.deltaI).toBeLessThan(0);
    });

    it('should provide meaningful description', () => {
      const impact = analyzeFiscalPolicyImpact(defaultISParams, defaultLMParams, 100);
      expect(impact.description).toContain('Expansionary fiscal policy');
    });
  });

  describe('analyzeMonetaryPolicyImpact', () => {
    it('should show positive income and negative interest rate impact from expansionary monetary policy', () => {
      const impact = analyzeMonetaryPolicyImpact(defaultISParams, defaultLMParams, 500);
      
      expect(impact.deltaY).toBeGreaterThan(0);
      expect(impact.deltaI).toBeLessThan(0);
    });

    it('should show opposite effects for contractionary monetary policy', () => {
      const impact = analyzeMonetaryPolicyImpact(defaultISParams, defaultLMParams, -500);
      
      expect(impact.deltaY).toBeLessThan(0);
      expect(impact.deltaI).toBeGreaterThan(0);
    });
  });

  describe('calculateFiscalMultiplier', () => {
    it('should return a positive multiplier', () => {
      const multiplier = calculateFiscalMultiplier(defaultISParams, defaultLMParams);
      expect(multiplier).toBeGreaterThan(0);
    });

    it('should be less than simple multiplier due to crowding out', () => {
      const multiplier = calculateFiscalMultiplier(defaultISParams, defaultLMParams);
      // Simple multiplier = 1 / (1 - MPC*(1-t) + m)
      const simpleMultiplier = 1 / (1 - defaultISParams.marginalPropensityConsume * (1 - defaultISParams.taxRate) + defaultISParams.importPropensity);
      
      // With interest rate effects (crowding out), multiplier should be smaller
      expect(multiplier).toBeLessThan(simpleMultiplier);
    });
  });

  describe('calculateMonetaryMultiplier', () => {
    it('should return a positive multiplier', () => {
      const multiplier = calculateMonetaryMultiplier(defaultISParams, defaultLMParams);
      expect(multiplier).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// CHART DATA GENERATION TESTS
// =============================================================================

describe('Chart Data Generation', () => {
  describe('generateChartData', () => {
    it('should return array of chart data points', () => {
      const data = generateChartData(defaultISParams, defaultLMParams, defaultBOPParams);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should include income and curve values', () => {
      const data = generateChartData(defaultISParams, defaultLMParams, defaultBOPParams);
      
      data.forEach(point => {
        expect(point).toHaveProperty('income');
        expect(typeof point.income).toBe('number');
      });
    });

    it('should respect numPoints parameter', () => {
      const data = generateChartData(defaultISParams, defaultLMParams, defaultBOPParams, 0, 2000, 50);
      expect(data.length).toBe(50);
    });
  });

  describe('generateCurveDataSets', () => {
    it('should return three curve datasets (IS, LM, BOP)', () => {
      const curves = generateCurveDataSets(defaultISParams, defaultLMParams, defaultBOPParams);
      
      expect(curves).toHaveLength(3);
    });

    it('should include labels and colors for each curve', () => {
      const curves = generateCurveDataSets(defaultISParams, defaultLMParams, defaultBOPParams);
      
      curves.forEach(curve => {
        expect(curve).toHaveProperty('label');
        expect(curve).toHaveProperty('color');
        expect(curve).toHaveProperty('points');
        expect(Array.isArray(curve.points)).toBe(true);
      });
    });

    it('should have correct labels', () => {
      const curves = generateCurveDataSets(defaultISParams, defaultLMParams, defaultBOPParams);
      
      expect(curves[0].label).toBe('IS Curve');
      expect(curves[1].label).toBe('LM Curve');
      expect(curves[2].label).toBe('BOP Curve');
    });
  });
});

// =============================================================================
// EDGE CASES AND BOUNDARY TESTS
// =============================================================================

describe('Edge Cases', () => {
  describe('Zero values', () => {
    it('should handle zero government spending', () => {
      const params: ISCurveParams = {
        ...defaultISParams,
        governmentSpending: 0,
      };
      const points = calculateISCurve(params);
      expect(points.length).toBeGreaterThan(0);
    });

    it('should handle zero exports', () => {
      const params: ISCurveParams = {
        ...defaultISParams,
        exports: 0,
      };
      const points = calculateISCurve(params);
      expect(points.length).toBeGreaterThan(0);
    });
  });

  describe('Extreme values', () => {
    it('should handle high tax rate', () => {
      const params: ISCurveParams = {
        ...defaultISParams,
        taxRate: 0.9,
      };
      const equilibrium = calculateISLMEquilibrium(params, defaultLMParams);
      expect(equilibrium.isValid).toBe(true);
    });

    it('should handle very low MPC', () => {
      const params: ISCurveParams = {
        ...defaultISParams,
        marginalPropensityConsume: 0.1,
      };
      const equilibrium = calculateISLMEquilibrium(params, defaultLMParams);
      expect(equilibrium.Y).toBeGreaterThan(0);
    });
  });

  describe('Income/Interest rate ranges', () => {
    it('should work with custom Y range', () => {
      const points = calculateISCurve(defaultISParams, 1000, 3000, 20);
      expect(points.length).toBeLessThanOrEqual(20);
      if (points.length > 0) {
        expect(points[0].x).toBeGreaterThanOrEqual(1000);
      }
    });
  });
});
