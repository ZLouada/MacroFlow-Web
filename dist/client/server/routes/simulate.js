"use strict";
/**
 * Mundell-Fleming Simulation API Routes
 *
 * Provides headless endpoints for economic simulations.
 * All inputs are validated using Zod schemas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const mundellFleming_ts_1 = require("../../src/lib/economics/mundellFleming.ts");
// ============================================================================
// Zod Schemas for Request Validation
// ============================================================================
const ISParamsSchema = zod_1.z.object({
    autonomousConsumption: zod_1.z.number().positive().default(200),
    marginalPropensityConsume: zod_1.z.number().min(0).max(1).default(0.75),
    taxRate: zod_1.z.number().min(0).max(1).default(0.25),
    autonomousInvestment: zod_1.z.number().positive().default(300),
    investmentSensitivity: zod_1.z.number().positive().default(50),
    governmentSpending: zod_1.z.number().nonnegative().default(400),
    exports: zod_1.z.number().nonnegative().default(200),
    importPropensity: zod_1.z.number().min(0).max(1).default(0.15),
});
const LMParamsSchema = zod_1.z.object({
    moneySupply: zod_1.z.number().positive().default(1500),
    priceLevel: zod_1.z.number().positive().default(1),
    moneyDemandIncomeSensitivity: zod_1.z.number().positive().default(0.5),
    moneyDemandInterestSensitivity: zod_1.z.number().positive().default(100),
});
const BOPParamsSchema = zod_1.z.object({
    worldInterestRate: zod_1.z.number().min(0).default(5),
    exports: zod_1.z.number().nonnegative().default(200),
    importPropensity: zod_1.z.number().min(0).max(1).default(0.15),
    capitalFlowSensitivity: zod_1.z.number().nonnegative().default(1000),
    capitalMobility: zod_1.z.enum(['perfect', 'imperfect', 'none']).default('perfect'),
});
const ChartOptionsSchema = zod_1.z.object({
    yMin: zod_1.z.number().nonnegative().default(0),
    yMax: zod_1.z.number().positive().default(5000),
    numPoints: zod_1.z.number().int().min(10).max(500).default(100),
});
const MundellFlemingRequestSchema = zod_1.z.object({
    is: ISParamsSchema.optional(),
    lm: LMParamsSchema.optional(),
    bop: BOPParamsSchema.optional(),
    exchangeRateRegime: zod_1.z.enum(['fixed', 'floating']).default('floating'),
    includeChartData: zod_1.z.boolean().default(false),
    includeCurves: zod_1.z.boolean().default(false),
    includeMultipliers: zod_1.z.boolean().default(false),
    chartOptions: ChartOptionsSchema.optional(),
});
const ISLMRequestSchema = zod_1.z.object({
    is: ISParamsSchema.optional(),
    lm: LMParamsSchema.optional(),
    includeChartData: zod_1.z.boolean().default(false),
    chartOptions: ChartOptionsSchema.optional(),
});
const CurvesRequestSchema = zod_1.z.object({
    is: ISParamsSchema.optional(),
    lm: LMParamsSchema.optional(),
    bop: BOPParamsSchema.optional(),
    curves: zod_1.z.array(zod_1.z.enum(['IS', 'LM', 'BOP'])).default(['IS', 'LM', 'BOP']),
    chartOptions: ChartOptionsSchema.optional(),
});
// ============================================================================
// Router Setup
// ============================================================================
exports.simulateRouter = (0, express_1.Router)();
// ============================================================================
// Validation Middleware
// ============================================================================
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body || {});
            if (!result.success) {
                const zodError = result.error;
                res.status(400).json({
                    error: 'Validation Error',
                    details: zodError.issues.map((e) => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
// ============================================================================
// POST /api/simulate/mundell-fleming
// ============================================================================
/**
 * Full Mundell-Fleming IS-LM-BOP simulation
 *
 * @example Request body:
 * {
 *   "is": {
 *     "autonomousConsumption": 200,
 *     "marginalPropensityConsume": 0.75,
 *     "taxRate": 0.25,
 *     "autonomousInvestment": 300,
 *     "investmentSensitivity": 50,
 *     "governmentSpending": 400,
 *     "exports": 200,
 *     "importPropensity": 0.15
 *   },
 *   "lm": {
 *     "moneySupply": 1500,
 *     "priceLevel": 1,
 *     "moneyDemandIncomeSensitivity": 0.5,
 *     "moneyDemandInterestSensitivity": 100
 *   },
 *   "bop": {
 *     "worldInterestRate": 5,
 *     "exports": 200,
 *     "importPropensity": 0.15,
 *     "capitalFlowSensitivity": 1000,
 *     "capitalMobility": "perfect"
 *   },
 *   "exchangeRateRegime": "floating",
 *   "includeChartData": true,
 *   "includeCurves": true,
 *   "includeMultipliers": true
 * }
 *
 * @example Response:
 * {
 *   "equilibrium": { "Y": 2500, "i": 7.5, "isValid": true },
 *   "params": { ... },
 *   "chartData": [ ... ],
 *   "curves": { "IS": [...], "LM": [...], "BOP": [...] },
 *   "multipliers": { "fiscal": 2.5, "monetary": 1.2 }
 * }
 */
exports.simulateRouter.post('/mundell-fleming', validateBody(MundellFlemingRequestSchema), (req, res) => {
    const { is, lm, bop, exchangeRateRegime, includeChartData, includeCurves, includeMultipliers, chartOptions, } = req.body;
    // Use defaults for any missing parameters
    const isParams = {
        autonomousConsumption: is?.autonomousConsumption ?? 200,
        marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
        taxRate: is?.taxRate ?? 0.25,
        autonomousInvestment: is?.autonomousInvestment ?? 300,
        investmentSensitivity: is?.investmentSensitivity ?? 50,
        governmentSpending: is?.governmentSpending ?? 400,
        exports: is?.exports ?? 200,
        importPropensity: is?.importPropensity ?? 0.15,
    };
    const lmParams = {
        moneySupply: lm?.moneySupply ?? 1500,
        priceLevel: lm?.priceLevel ?? 1,
        moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
        moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };
    const bopParams = {
        worldInterestRate: bop?.worldInterestRate ?? 5,
        exports: bop?.exports ?? 200,
        importPropensity: bop?.importPropensity ?? 0.15,
        capitalFlowSensitivity: bop?.capitalFlowSensitivity ?? 1000,
        capitalMobility: bop?.capitalMobility ?? 'perfect',
    };
    const opts = {
        yMin: chartOptions?.yMin ?? 0,
        yMax: chartOptions?.yMax ?? 5000,
        numPoints: chartOptions?.numPoints ?? 100,
    };
    // Calculate equilibrium
    const equilibrium = (0, mundellFleming_ts_1.calculateMundellFlemingEquilibrium)(isParams, lmParams, bopParams, exchangeRateRegime);
    // Build response
    const response = {
        equilibrium,
        params: {
            is: isParams,
            lm: lmParams,
            bop: bopParams,
            exchangeRateRegime,
        },
    };
    // Include chart data if requested
    if (includeChartData) {
        response.chartData = (0, mundellFleming_ts_1.generateChartData)(isParams, lmParams, bopParams, opts.yMin, opts.yMax, opts.numPoints);
    }
    // Include individual curves if requested
    if (includeCurves) {
        response.curves = {
            IS: (0, mundellFleming_ts_1.calculateISCurve)(isParams, opts.yMin, opts.yMax, opts.numPoints),
            LM: (0, mundellFleming_ts_1.calculateLMCurve)(lmParams, opts.yMin, opts.yMax, opts.numPoints),
            BOP: (0, mundellFleming_ts_1.calculateBOPCurve)(bopParams, opts.yMin, opts.yMax, opts.numPoints),
        };
    }
    // Include multipliers if requested
    if (includeMultipliers) {
        response.multipliers = {
            fiscal: (0, mundellFleming_ts_1.calculateFiscalMultiplier)(isParams, lmParams),
            monetary: (0, mundellFleming_ts_1.calculateMonetaryMultiplier)(isParams, lmParams),
        };
    }
    res.json(response);
});
// ============================================================================
// POST /api/simulate/is-lm
// ============================================================================
/**
 * Basic IS-LM equilibrium (closed economy)
 *
 * @example Request body:
 * {
 *   "is": { ... },
 *   "lm": { ... },
 *   "includeChartData": true
 * }
 */
exports.simulateRouter.post('/is-lm', validateBody(ISLMRequestSchema), (req, res) => {
    const { is, lm, includeChartData, chartOptions } = req.body;
    const isParams = {
        autonomousConsumption: is?.autonomousConsumption ?? 200,
        marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
        taxRate: is?.taxRate ?? 0.25,
        autonomousInvestment: is?.autonomousInvestment ?? 300,
        investmentSensitivity: is?.investmentSensitivity ?? 50,
        governmentSpending: is?.governmentSpending ?? 400,
        exports: is?.exports ?? 200,
        importPropensity: is?.importPropensity ?? 0.15,
    };
    const lmParams = {
        moneySupply: lm?.moneySupply ?? 1500,
        priceLevel: lm?.priceLevel ?? 1,
        moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
        moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };
    const equilibrium = (0, mundellFleming_ts_1.calculateISLMEquilibrium)(isParams, lmParams);
    const response = {
        equilibrium,
        params: { is: isParams, lm: lmParams },
    };
    if (includeChartData) {
        const opts = {
            yMin: chartOptions?.yMin ?? 0,
            yMax: chartOptions?.yMax ?? 5000,
            numPoints: chartOptions?.numPoints ?? 100,
        };
        response.curves = {
            IS: (0, mundellFleming_ts_1.calculateISCurve)(isParams, opts.yMin, opts.yMax, opts.numPoints),
            LM: (0, mundellFleming_ts_1.calculateLMCurve)(lmParams, opts.yMin, opts.yMax, opts.numPoints),
        };
    }
    res.json(response);
});
// ============================================================================
// POST /api/simulate/curves
// ============================================================================
/**
 * Generate curve data for visualization
 *
 * @example Request body:
 * {
 *   "is": { ... },
 *   "lm": { ... },
 *   "bop": { ... },
 *   "curves": ["IS", "LM", "BOP"],
 *   "chartOptions": { "yMin": 0, "yMax": 5000, "numPoints": 100 }
 * }
 */
exports.simulateRouter.post('/curves', validateBody(CurvesRequestSchema), (req, res) => {
    const { is, lm, bop, curves, chartOptions } = req.body;
    const opts = {
        yMin: chartOptions?.yMin ?? 0,
        yMax: chartOptions?.yMax ?? 5000,
        numPoints: chartOptions?.numPoints ?? 100,
    };
    const isParams = {
        autonomousConsumption: is?.autonomousConsumption ?? 200,
        marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
        taxRate: is?.taxRate ?? 0.25,
        autonomousInvestment: is?.autonomousInvestment ?? 300,
        investmentSensitivity: is?.investmentSensitivity ?? 50,
        governmentSpending: is?.governmentSpending ?? 400,
        exports: is?.exports ?? 200,
        importPropensity: is?.importPropensity ?? 0.15,
    };
    const lmParams = {
        moneySupply: lm?.moneySupply ?? 1500,
        priceLevel: lm?.priceLevel ?? 1,
        moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
        moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };
    const bopParams = {
        worldInterestRate: bop?.worldInterestRate ?? 5,
        exports: bop?.exports ?? 200,
        importPropensity: bop?.importPropensity ?? 0.15,
        capitalFlowSensitivity: bop?.capitalFlowSensitivity ?? 1000,
        capitalMobility: bop?.capitalMobility ?? 'perfect',
    };
    const response = {
        params: { is: isParams, lm: lmParams, bop: bopParams },
        curves: {},
    };
    const curvesData = response.curves;
    if (curves.includes('IS')) {
        curvesData.IS = (0, mundellFleming_ts_1.calculateISCurve)(isParams, opts.yMin, opts.yMax, opts.numPoints);
    }
    if (curves.includes('LM')) {
        curvesData.LM = (0, mundellFleming_ts_1.calculateLMCurve)(lmParams, opts.yMin, opts.yMax, opts.numPoints);
    }
    if (curves.includes('BOP')) {
        curvesData.BOP = (0, mundellFleming_ts_1.calculateBOPCurve)(bopParams, opts.yMin, opts.yMax, opts.numPoints);
    }
    res.json(response);
});
exports.default = exports.simulateRouter;
//# sourceMappingURL=simulate.js.map