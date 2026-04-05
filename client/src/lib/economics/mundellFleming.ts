/**
 * Mundell-Fleming Model Utility Functions
 * 
 * Pure TypeScript implementation of the IS-LM-BOP model for open economies.
 * These functions return coordinate arrays compatible with Recharts/Tremor visualization.
 * 
 * The Mundell-Fleming model extends the IS-LM framework to include international trade
 * and capital flows, making it suitable for analyzing open economy macroeconomics.
 */

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Point {
  x: number; // Income (Y)
  y: number; // Interest Rate (i)
}

export interface CurveData {
  points: Point[];
  label: string;
  color?: string;
}

export interface ISCurveParams {
  /** Autonomous consumption (C₀) */
  autonomousConsumption: number;
  /** Marginal propensity to consume (c), 0 < c < 1 */
  marginalPropensityConsume: number;
  /** Tax rate (t), 0 < t < 1 */
  taxRate: number;
  /** Autonomous investment (I₀) */
  autonomousInvestment: number;
  /** Investment sensitivity to interest rate (b) */
  investmentSensitivity: number;
  /** Government spending (G) */
  governmentSpending: number;
  /** Exports (X) */
  exports: number;
  /** Marginal propensity to import (m) */
  importPropensity: number;
}

export interface LMCurveParams {
  /** Money supply (M) */
  moneySupply: number;
  /** Price level (P) */
  priceLevel: number;
  /** Income sensitivity of money demand (k) */
  moneyDemandIncomeSensitivity: number;
  /** Interest rate sensitivity of money demand (h) */
  moneyDemandInterestSensitivity: number;
}

export interface BOPCurveParams {
  /** World interest rate (i*) */
  worldInterestRate: number;
  /** Exports (X) */
  exports: number;
  /** Marginal propensity to import (m) */
  importPropensity: number;
  /** Capital flow sensitivity to interest rate differential */
  capitalFlowSensitivity: number;
  /** Capital mobility: 'perfect' | 'imperfect' | 'none' */
  capitalMobility: 'perfect' | 'imperfect' | 'none';
}

export interface EquilibriumResult {
  /** Equilibrium income */
  Y: number;
  /** Equilibrium interest rate */
  i: number;
  /** Is the equilibrium valid (all values positive) */
  isValid: boolean;
}

export interface MundellFlemingParams {
  is: ISCurveParams;
  lm: LMCurveParams;
  bop: BOPCurveParams;
}

// =============================================================================
// IS CURVE FUNCTIONS
// =============================================================================

/**
 * Calculate the IS curve points.
 * 
 * The IS curve represents equilibrium in the goods market where Y = C + I + G + NX
 * 
 * Derivation:
 * Y = C₀ + c(Y - T) + I₀ - bi + G + X - mY
 * Y = C₀ + c(1-t)Y + I₀ - bi + G + X - mY
 * Y(1 - c(1-t) + m) = C₀ + I₀ + G + X - bi
 * Y = [C₀ + I₀ + G + X - bi] / [1 - c(1-t) + m]
 * 
 * Solving for i in terms of Y:
 * i = [C₀ + I₀ + G + X] / b - Y[1 - c(1-t) + m] / b
 * 
 * @param params - IS curve parameters
 * @param yMin - Minimum income value
 * @param yMax - Maximum income value
 * @param numPoints - Number of points to generate
 * @returns Array of points for the IS curve
 */
export function calculateISCurve(
  params: ISCurveParams,
  yMin: number = 0,
  yMax: number = 5000,
  numPoints: number = 100
): Point[] {
  const {
    autonomousConsumption,
    marginalPropensityConsume,
    taxRate,
    autonomousInvestment,
    investmentSensitivity,
    governmentSpending,
    exports,
    importPropensity,
  } = params;

  // Calculate the slope denominator
  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  
  // Autonomous expenditure
  const autonomousExpenditure = autonomousConsumption + autonomousInvestment + governmentSpending + exports;
  
  const points: Point[] = [];
  const step = (yMax - yMin) / (numPoints - 1);

  for (let j = 0; j < numPoints; j++) {
    const y = yMin + j * step;
    // i = (A - Y * leakageRate) / b
    // where A is autonomous expenditure
    const i = (autonomousExpenditure - y * leakageRate) / investmentSensitivity;
    
    if (i >= 0) {
      points.push({ x: y, y: i });
    }
  }

  return points;
}

/**
 * Get the income level for a given interest rate on the IS curve.
 * Y = [A - bi] / leakageRate
 */
export function getISIncomeAtInterestRate(params: ISCurveParams, interestRate: number): number {
  const {
    autonomousConsumption,
    marginalPropensityConsume,
    taxRate,
    autonomousInvestment,
    investmentSensitivity,
    governmentSpending,
    exports,
    importPropensity,
  } = params;

  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  const autonomousExpenditure = autonomousConsumption + autonomousInvestment + governmentSpending + exports;
  
  return (autonomousExpenditure - investmentSensitivity * interestRate) / leakageRate;
}

/**
 * Get the interest rate for a given income level on the IS curve.
 */
export function getISInterestRateAtIncome(params: ISCurveParams, income: number): number {
  const {
    autonomousConsumption,
    marginalPropensityConsume,
    taxRate,
    autonomousInvestment,
    investmentSensitivity,
    governmentSpending,
    exports,
    importPropensity,
  } = params;

  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  const autonomousExpenditure = autonomousConsumption + autonomousInvestment + governmentSpending + exports;
  
  return (autonomousExpenditure - income * leakageRate) / investmentSensitivity;
}

// =============================================================================
// LM CURVE FUNCTIONS
// =============================================================================

/**
 * Calculate the LM curve points.
 * 
 * The LM curve represents equilibrium in the money market where M/P = kY - hi
 * 
 * Derivation:
 * M/P = kY - hi (Money demand = Money supply in real terms)
 * hi = kY - M/P
 * i = (kY - M/P) / h
 * i = (k/h)Y - (M/P)/h
 * 
 * @param params - LM curve parameters
 * @param yMin - Minimum income value
 * @param yMax - Maximum income value
 * @param numPoints - Number of points to generate
 * @returns Array of points for the LM curve
 */
export function calculateLMCurve(
  params: LMCurveParams,
  yMin: number = 0,
  yMax: number = 5000,
  numPoints: number = 100
): Point[] {
  const {
    moneySupply,
    priceLevel,
    moneyDemandIncomeSensitivity,
    moneyDemandInterestSensitivity,
  } = params;

  const realMoneySupply = moneySupply / priceLevel;
  const points: Point[] = [];
  const step = (yMax - yMin) / (numPoints - 1);

  for (let j = 0; j < numPoints; j++) {
    const y = yMin + j * step;
    // i = (kY - M/P) / h
    const i = (moneyDemandIncomeSensitivity * y - realMoneySupply) / moneyDemandInterestSensitivity;
    
    if (i >= 0) {
      points.push({ x: y, y: i });
    }
  }

  return points;
}

/**
 * Get the income level for a given interest rate on the LM curve.
 * Y = (hi + M/P) / k
 */
export function getLMIncomeAtInterestRate(params: LMCurveParams, interestRate: number): number {
  const {
    moneySupply,
    priceLevel,
    moneyDemandIncomeSensitivity,
    moneyDemandInterestSensitivity,
  } = params;

  const realMoneySupply = moneySupply / priceLevel;
  return (moneyDemandInterestSensitivity * interestRate + realMoneySupply) / moneyDemandIncomeSensitivity;
}

/**
 * Get the interest rate for a given income level on the LM curve.
 */
export function getLMInterestRateAtIncome(params: LMCurveParams, income: number): number {
  const {
    moneySupply,
    priceLevel,
    moneyDemandIncomeSensitivity,
    moneyDemandInterestSensitivity,
  } = params;

  const realMoneySupply = moneySupply / priceLevel;
  return (moneyDemandIncomeSensitivity * income - realMoneySupply) / moneyDemandInterestSensitivity;
}

// =============================================================================
// BOP CURVE FUNCTIONS
// =============================================================================

/**
 * Calculate the BOP (Balance of Payments) curve points.
 * 
 * The BOP curve represents external equilibrium where CA + KA = 0
 * CA = X - mY (Current Account)
 * KA = CF(i - i*) (Capital Account)
 * 
 * For perfect capital mobility: BOP is horizontal at i = i*
 * For imperfect capital mobility: BOP has positive slope
 * For no capital mobility: BOP is vertical
 * 
 * Derivation for imperfect capital mobility:
 * X - mY + CF(i - i*) = 0
 * CF*i = mY - X + CF*i*
 * i = (m/CF)Y - X/CF + i*
 * 
 * @param params - BOP curve parameters
 * @param yMin - Minimum income value
 * @param yMax - Maximum income value
 * @param numPoints - Number of points to generate
 * @returns Array of points for the BOP curve
 */
export function calculateBOPCurve(
  params: BOPCurveParams,
  yMin: number = 0,
  yMax: number = 5000,
  numPoints: number = 100
): Point[] {
  const {
    worldInterestRate,
    exports,
    importPropensity,
    capitalFlowSensitivity,
    capitalMobility,
  } = params;

  const points: Point[] = [];
  const step = (yMax - yMin) / (numPoints - 1);

  // Perfect capital mobility: horizontal line at world interest rate
  if (capitalMobility === 'perfect') {
    for (let j = 0; j < numPoints; j++) {
      const y = yMin + j * step;
      points.push({ x: y, y: worldInterestRate });
    }
    return points;
  }

  // No capital mobility: vertical line where trade is balanced (X = mY)
  if (capitalMobility === 'none') {
    const balancedTradeIncome = exports / importPropensity;
    const iMin = 0;
    const iMax = 0.2; // 20% max interest rate for visualization
    const iStep = (iMax - iMin) / (numPoints - 1);
    
    for (let j = 0; j < numPoints; j++) {
      const i = iMin + j * iStep;
      points.push({ x: balancedTradeIncome, y: i });
    }
    return points;
  }

  // Imperfect capital mobility: positive slope
  // i = (m/CF)Y - X/CF + i*
  for (let j = 0; j < numPoints; j++) {
    const y = yMin + j * step;
    const i = (importPropensity / capitalFlowSensitivity) * y 
            - exports / capitalFlowSensitivity 
            + worldInterestRate;
    
    if (i >= 0) {
      points.push({ x: y, y: i });
    }
  }

  return points;
}

/**
 * Get the income level for a given interest rate on the BOP curve.
 */
export function getBOPIncomeAtInterestRate(params: BOPCurveParams, interestRate: number): number {
  const {
    worldInterestRate,
    exports,
    importPropensity,
    capitalFlowSensitivity,
    capitalMobility,
  } = params;

  if (capitalMobility === 'perfect') {
    // Any income level is compatible with i = i*
    return Infinity;
  }

  if (capitalMobility === 'none') {
    // Income is fixed at balanced trade level
    return exports / importPropensity;
  }

  // Y = CF/m * (i - i*) + X/m
  return (capitalFlowSensitivity / importPropensity) * (interestRate - worldInterestRate) 
       + exports / importPropensity;
}

// =============================================================================
// EQUILIBRIUM CALCULATIONS
// =============================================================================

/**
 * Calculate the IS-LM equilibrium point.
 * 
 * Solves the system of equations:
 * IS: Y = [A - bi] / leakageRate
 * LM: i = (kY - M/P) / h
 * 
 * Substituting LM into IS:
 * Y = [A - b(kY - M/P)/h] / leakageRate
 * Y * leakageRate = A - (bk/h)Y + (b*M/P)/h
 * Y * leakageRate + (bk/h)Y = A + (b*M/P)/h
 * Y * (leakageRate + bk/h) = A + b*M/(P*h)
 * Y = [A + b*M/(P*h)] / (leakageRate + bk/h)
 */
export function calculateISLMEquilibrium(
  isParams: ISCurveParams,
  lmParams: LMCurveParams
): EquilibriumResult {
  const {
    autonomousConsumption,
    marginalPropensityConsume,
    taxRate,
    autonomousInvestment,
    investmentSensitivity,
    governmentSpending,
    exports,
    importPropensity,
  } = isParams;

  const {
    moneySupply,
    priceLevel,
    moneyDemandIncomeSensitivity,
    moneyDemandInterestSensitivity,
  } = lmParams;

  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  const autonomousExpenditure = autonomousConsumption + autonomousInvestment + governmentSpending + exports;
  const realMoneySupply = moneySupply / priceLevel;

  // Coefficient calculations
  const b = investmentSensitivity;
  const k = moneyDemandIncomeSensitivity;
  const h = moneyDemandInterestSensitivity;

  // Calculate equilibrium Y
  const numerator = autonomousExpenditure + (b * realMoneySupply) / h;
  const denominator = leakageRate + (b * k) / h;
  const Y = numerator / denominator;

  // Calculate equilibrium i from LM curve
  const i = (k * Y - realMoneySupply) / h;

  return {
    Y,
    i,
    isValid: Y > 0 && i >= 0,
  };
}

/**
 * Calculate the full Mundell-Fleming equilibrium (IS-LM-BOP).
 * 
 * Under different exchange rate regimes:
 * - Fixed exchange rate: Money supply adjusts to maintain BOP equilibrium
 * - Floating exchange rate: Exchange rate adjusts to maintain BOP equilibrium
 */
export function calculateMundellFlemingEquilibrium(
  isParams: ISCurveParams,
  lmParams: LMCurveParams,
  bopParams: BOPCurveParams,
  exchangeRateRegime: 'fixed' | 'floating'
): EquilibriumResult & { adjustedMoneySupply?: number; adjustedExchangeRate?: number } {
  const islmEquilibrium = calculateISLMEquilibrium(isParams, lmParams);
  
  if (bopParams.capitalMobility === 'perfect') {
    // With perfect capital mobility, domestic interest rate must equal world rate
    if (exchangeRateRegime === 'fixed') {
      // Monetary policy is ineffective
      // Interest rate is fixed at i*
      const Y = getISIncomeAtInterestRate(isParams, bopParams.worldInterestRate);
      const requiredMoneySupply = calculateRequiredMoneySupply(
        lmParams,
        Y,
        bopParams.worldInterestRate
      );
      
      return {
        Y,
        i: bopParams.worldInterestRate,
        isValid: Y > 0,
        adjustedMoneySupply: requiredMoneySupply,
      };
    } else {
      // Floating rate: fiscal policy affects exchange rate
      // IS-LM equilibrium determines Y and i
      // Exchange rate adjusts to maintain BOP equilibrium
      return {
        ...islmEquilibrium,
        adjustedExchangeRate: calculateImpliedExchangeRate(isParams, islmEquilibrium.Y),
      };
    }
  }

  // For imperfect or no capital mobility, use standard IS-LM equilibrium
  return islmEquilibrium;
}

/**
 * Calculate the money supply required to achieve a target interest rate and income.
 */
function calculateRequiredMoneySupply(
  lmParams: LMCurveParams,
  targetY: number,
  targetI: number
): number {
  const { priceLevel, moneyDemandIncomeSensitivity, moneyDemandInterestSensitivity } = lmParams;
  
  // M/P = kY - hi
  // M = P * (kY - hi)
  const realMoneyDemand = moneyDemandIncomeSensitivity * targetY - moneyDemandInterestSensitivity * targetI;
  return realMoneyDemand * priceLevel;
}

/**
 * Calculate the implied exchange rate for trade balance adjustment.
 * This is a simplified model where exchange rate affects exports.
 */
function calculateImpliedExchangeRate(isParams: ISCurveParams, equilibriumY: number): number {
  const { exports, importPropensity } = isParams;
  const imports = importPropensity * equilibriumY;
  
  // If imports > exports, currency should depreciate (exchange rate increases)
  // Base exchange rate is 1.0
  const tradeBalance = exports - imports;
  const exchangeRateAdjustment = -tradeBalance / (exports * 2); // Simplified adjustment factor
  
  return Math.max(0.5, Math.min(2.0, 1.0 + exchangeRateAdjustment));
}

// =============================================================================
// RECHARTS/TREMOR FORMATTED OUTPUT
// =============================================================================

export interface ChartDataPoint {
  income: number;
  IS?: number;
  LM?: number;
  BOP?: number;
}

/**
 * Generate combined chart data for Recharts/Tremor visualization.
 * Returns data in a format directly compatible with Recharts LineChart.
 */
export function generateChartData(
  isParams: ISCurveParams,
  lmParams: LMCurveParams,
  bopParams: BOPCurveParams,
  yMin: number = 0,
  yMax: number = 5000,
  numPoints: number = 100
): ChartDataPoint[] {
  const isPoints = calculateISCurve(isParams, yMin, yMax, numPoints);
  const lmPoints = calculateLMCurve(lmParams, yMin, yMax, numPoints);
  const bopPoints = calculateBOPCurve(bopParams, yMin, yMax, numPoints);

  // Create a map of income values to interest rates
  const chartData: ChartDataPoint[] = [];
  const step = (yMax - yMin) / (numPoints - 1);

  for (let j = 0; j < numPoints; j++) {
    const income = yMin + j * step;
    const dataPoint: ChartDataPoint = { income };

    // Find IS value at this income
    const isPoint = isPoints.find((p) => Math.abs(p.x - income) < step / 2);
    if (isPoint) dataPoint.IS = isPoint.y;

    // Find LM value at this income
    const lmPoint = lmPoints.find((p) => Math.abs(p.x - income) < step / 2);
    if (lmPoint) dataPoint.LM = lmPoint.y;

    // Find BOP value at this income
    const bopPoint = bopPoints.find((p) => Math.abs(p.x - income) < step / 2);
    if (bopPoint) dataPoint.BOP = bopPoint.y;

    chartData.push(dataPoint);
  }

  return chartData;
}

/**
 * Generate curve data with labels and colors for visualization.
 */
export function generateCurveDataSets(
  isParams: ISCurveParams,
  lmParams: LMCurveParams,
  bopParams: BOPCurveParams,
  yMin: number = 0,
  yMax: number = 5000,
  numPoints: number = 100
): CurveData[] {
  return [
    {
      points: calculateISCurve(isParams, yMin, yMax, numPoints),
      label: 'IS Curve',
      color: '#ef4444', // Red
    },
    {
      points: calculateLMCurve(lmParams, yMin, yMax, numPoints),
      label: 'LM Curve',
      color: '#3b82f6', // Blue
    },
    {
      points: calculateBOPCurve(bopParams, yMin, yMax, numPoints),
      label: 'BOP Curve',
      color: '#22c55e', // Green
    },
  ];
}

// =============================================================================
// POLICY ANALYSIS FUNCTIONS
// =============================================================================

export interface PolicyImpact {
  initialEquilibrium: EquilibriumResult;
  newEquilibrium: EquilibriumResult;
  deltaY: number;
  deltaI: number;
  multiplier: number;
  description: string;
}

/**
 * Analyze the impact of a fiscal policy change (change in G).
 */
export function analyzeFiscalPolicyImpact(
  isParams: ISCurveParams,
  lmParams: LMCurveParams,
  deltaG: number
): PolicyImpact {
  const initialEquilibrium = calculateISLMEquilibrium(isParams, lmParams);
  
  const newIsParams: ISCurveParams = {
    ...isParams,
    governmentSpending: isParams.governmentSpending + deltaG,
  };
  
  const newEquilibrium = calculateISLMEquilibrium(newIsParams, lmParams);
  
  const deltaY = newEquilibrium.Y - initialEquilibrium.Y;
  const deltaI = newEquilibrium.i - initialEquilibrium.i;
  const multiplier = deltaG !== 0 ? deltaY / deltaG : 0;
  
  return {
    initialEquilibrium,
    newEquilibrium,
    deltaY,
    deltaI,
    multiplier,
    description: deltaG > 0
      ? `Expansionary fiscal policy: Government spending increased by ${deltaG}. Output increased by ${deltaY.toFixed(2)}, interest rate increased by ${(deltaI * 100).toFixed(2)}%.`
      : `Contractionary fiscal policy: Government spending decreased by ${Math.abs(deltaG)}. Output decreased by ${Math.abs(deltaY).toFixed(2)}, interest rate decreased by ${(Math.abs(deltaI) * 100).toFixed(2)}%.`,
  };
}

/**
 * Analyze the impact of a monetary policy change (change in M).
 */
export function analyzeMonetaryPolicyImpact(
  isParams: ISCurveParams,
  lmParams: LMCurveParams,
  deltaM: number
): PolicyImpact {
  const initialEquilibrium = calculateISLMEquilibrium(isParams, lmParams);
  
  const newLmParams: LMCurveParams = {
    ...lmParams,
    moneySupply: lmParams.moneySupply + deltaM,
  };
  
  const newEquilibrium = calculateISLMEquilibrium(isParams, newLmParams);
  
  const deltaY = newEquilibrium.Y - initialEquilibrium.Y;
  const deltaI = newEquilibrium.i - initialEquilibrium.i;
  const multiplier = deltaM !== 0 ? deltaY / deltaM : 0;
  
  return {
    initialEquilibrium,
    newEquilibrium,
    deltaY,
    deltaI,
    multiplier,
    description: deltaM > 0
      ? `Expansionary monetary policy: Money supply increased by ${deltaM}. Output increased by ${deltaY.toFixed(2)}, interest rate decreased by ${(Math.abs(deltaI) * 100).toFixed(2)}%.`
      : `Contractionary monetary policy: Money supply decreased by ${Math.abs(deltaM)}. Output decreased by ${Math.abs(deltaY).toFixed(2)}, interest rate increased by ${(deltaI * 100).toFixed(2)}%.`,
  };
}

/**
 * Calculate the fiscal multiplier for the current parameters.
 */
export function calculateFiscalMultiplier(
  isParams: ISCurveParams,
  lmParams: LMCurveParams
): number {
  const { marginalPropensityConsume, taxRate, importPropensity, investmentSensitivity } = isParams;
  const { moneyDemandIncomeSensitivity, moneyDemandInterestSensitivity } = lmParams;
  
  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  const b = investmentSensitivity;
  const k = moneyDemandIncomeSensitivity;
  const h = moneyDemandInterestSensitivity;
  
  // dY/dG = 1 / (leakageRate + bk/h)
  return 1 / (leakageRate + (b * k) / h);
}

/**
 * Calculate the monetary policy multiplier for the current parameters.
 */
export function calculateMonetaryMultiplier(
  isParams: ISCurveParams,
  lmParams: LMCurveParams
): number {
  const { marginalPropensityConsume, taxRate, importPropensity, investmentSensitivity } = isParams;
  const { priceLevel, moneyDemandIncomeSensitivity, moneyDemandInterestSensitivity } = lmParams;
  
  const leakageRate = 1 - marginalPropensityConsume * (1 - taxRate) + importPropensity;
  const b = investmentSensitivity;
  const k = moneyDemandIncomeSensitivity;
  const h = moneyDemandInterestSensitivity;
  
  // dY/dM = (b/h) / [P * (leakageRate + bk/h)]
  return (b / h) / (priceLevel * (leakageRate + (b * k) / h));
}

// =============================================================================
// PHASE 2.1: TWO-COUNTRY SPILLOVER ENGINE
// =============================================================================

export interface SpilloverResult {
  economyA: {
    initialY: number;
    newY: number;
    deltaY: number;
    initialExchangeRate?: number;
    newExchangeRate?: number;
  };
  economyB: {
    initialY: number;
    newY: number;
    deltaY: number;
    deltaExports: number;
    initialTradeBalance: number;
    newTradeBalance: number;
    initialExchangeRate?: number;
    newExchangeRate?: number;
  };
}

/**
 * Calculate the spillover effects of a policy shock from Economy A to Economy B.
 * 
 * In a two-country Mundell-Fleming model, a fiscal expansion in A increases A's 
 * income, which increases A's imports. A's imports are B's exports, shifting B's 
 * IS curve outward and affecting B's trade balance and exchange rate.
 */
export function calculateSpilloverEffects(
  economyA: MundellFlemingParams,
  economyB: MundellFlemingParams,
  shockDeltaG: number
): SpilloverResult {
  // 1. Calculate A's initial equilibrium
  const initialEqA = calculateMundellFlemingEquilibrium(economyA.is, economyA.lm, economyA.bop, 'floating');
  
  // 2. Apply fiscal shock to A
  const shockedIsA = { ...economyA.is, governmentSpending: economyA.is.governmentSpending + shockDeltaG };
  const newEqA = calculateMundellFlemingEquilibrium(shockedIsA, economyA.lm, economyA.bop, 'floating');
  
  // 3. Calculate A's change in income
  const deltaYA = newEqA.Y - initialEqA.Y;
  
  // 4. A's imports = B's exports
  const deltaImportsA = deltaYA * economyA.is.importPropensity;
  const deltaExportsB = deltaImportsA;
  
  // 5. Calculate B's initial equilibrium
  const initialEqB = calculateMundellFlemingEquilibrium(economyB.is, economyB.lm, economyB.bop, 'floating');
  
  // 6. Apply spillover shock to B (increased exports)
  const shockedIsB = { ...economyB.is, exports: economyB.is.exports + deltaExportsB };
  const newEqB = calculateMundellFlemingEquilibrium(shockedIsB, economyB.lm, economyB.bop, 'floating');
  
  // 7. Calculate trade balances
  const initialTradeBalanceB = economyB.is.exports - (economyB.is.importPropensity * initialEqB.Y);
  const newTradeBalanceB = shockedIsB.exports - (economyB.is.importPropensity * newEqB.Y);

  return {
    economyA: {
      initialY: initialEqA.Y,
      newY: newEqA.Y,
      deltaY: deltaYA,
      initialExchangeRate: initialEqA.adjustedExchangeRate,
      newExchangeRate: newEqA.adjustedExchangeRate,
    },
    economyB: {
      initialY: initialEqB.Y,
      newY: newEqB.Y,
      deltaY: newEqB.Y - initialEqB.Y,
      deltaExports: deltaExportsB,
      initialTradeBalance: initialTradeBalanceB,
      newTradeBalance: newTradeBalanceB,
      initialExchangeRate: initialEqB.adjustedExchangeRate,
      newExchangeRate: newEqB.adjustedExchangeRate,
    }
  };
}
