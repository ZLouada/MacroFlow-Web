/**
 * Mundell-Fleming Model Utility Functions
 *
 * Pure TypeScript implementation of the IS-LM-BOP model for open economies.
 * These functions return coordinate arrays compatible with Recharts/Tremor visualization.
 *
 * The Mundell-Fleming model extends the IS-LM framework to include international trade
 * and capital flows, making it suitable for analyzing open economy macroeconomics.
 */
export interface Point {
    x: number;
    y: number;
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
export declare function calculateISCurve(params: ISCurveParams, yMin?: number, yMax?: number, numPoints?: number): Point[];
/**
 * Get the income level for a given interest rate on the IS curve.
 * Y = [A - bi] / leakageRate
 */
export declare function getISIncomeAtInterestRate(params: ISCurveParams, interestRate: number): number;
/**
 * Get the interest rate for a given income level on the IS curve.
 */
export declare function getISInterestRateAtIncome(params: ISCurveParams, income: number): number;
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
export declare function calculateLMCurve(params: LMCurveParams, yMin?: number, yMax?: number, numPoints?: number): Point[];
/**
 * Get the income level for a given interest rate on the LM curve.
 * Y = (hi + M/P) / k
 */
export declare function getLMIncomeAtInterestRate(params: LMCurveParams, interestRate: number): number;
/**
 * Get the interest rate for a given income level on the LM curve.
 */
export declare function getLMInterestRateAtIncome(params: LMCurveParams, income: number): number;
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
export declare function calculateBOPCurve(params: BOPCurveParams, yMin?: number, yMax?: number, numPoints?: number): Point[];
/**
 * Get the income level for a given interest rate on the BOP curve.
 */
export declare function getBOPIncomeAtInterestRate(params: BOPCurveParams, interestRate: number): number;
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
export declare function calculateISLMEquilibrium(isParams: ISCurveParams, lmParams: LMCurveParams): EquilibriumResult;
/**
 * Calculate the full Mundell-Fleming equilibrium (IS-LM-BOP).
 *
 * Under different exchange rate regimes:
 * - Fixed exchange rate: Money supply adjusts to maintain BOP equilibrium
 * - Floating exchange rate: Exchange rate adjusts to maintain BOP equilibrium
 */
export declare function calculateMundellFlemingEquilibrium(isParams: ISCurveParams, lmParams: LMCurveParams, bopParams: BOPCurveParams, exchangeRateRegime: 'fixed' | 'floating'): EquilibriumResult & {
    adjustedMoneySupply?: number;
    adjustedExchangeRate?: number;
};
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
export declare function generateChartData(isParams: ISCurveParams, lmParams: LMCurveParams, bopParams: BOPCurveParams, yMin?: number, yMax?: number, numPoints?: number): ChartDataPoint[];
/**
 * Generate curve data with labels and colors for visualization.
 */
export declare function generateCurveDataSets(isParams: ISCurveParams, lmParams: LMCurveParams, bopParams: BOPCurveParams, yMin?: number, yMax?: number, numPoints?: number): CurveData[];
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
export declare function analyzeFiscalPolicyImpact(isParams: ISCurveParams, lmParams: LMCurveParams, deltaG: number): PolicyImpact;
/**
 * Analyze the impact of a monetary policy change (change in M).
 */
export declare function analyzeMonetaryPolicyImpact(isParams: ISCurveParams, lmParams: LMCurveParams, deltaM: number): PolicyImpact;
/**
 * Calculate the fiscal multiplier for the current parameters.
 */
export declare function calculateFiscalMultiplier(isParams: ISCurveParams, lmParams: LMCurveParams): number;
/**
 * Calculate the monetary policy multiplier for the current parameters.
 */
export declare function calculateMonetaryMultiplier(isParams: ISCurveParams, lmParams: LMCurveParams): number;
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
export declare function calculateSpilloverEffects(economyA: MundellFlemingParams, economyB: MundellFlemingParams, shockDeltaG: number): SpilloverResult;
//# sourceMappingURL=mundellFleming.d.ts.map