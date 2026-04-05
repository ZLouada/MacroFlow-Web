/**
 * Mundell-Fleming Simulation API Routes
 * 
 * Provides headless endpoints for economic simulations.
 * All inputs are validated using Zod schemas.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  calculateISCurve,
  calculateLMCurve,
  calculateBOPCurve,
  calculateISLMEquilibrium,
  calculateMundellFlemingEquilibrium,
  generateChartData,
  calculateFiscalMultiplier,
  calculateMonetaryMultiplier,
  type ISCurveParams,
  type LMCurveParams,
  type BOPCurveParams,
} from '../../src/lib/economics/mundellFleming.ts';

// ============================================================================
// Zod Schemas for Request Validation
// ============================================================================

const ISParamsSchema = z.object({
  autonomousConsumption: z.number().positive().default(200),
  marginalPropensityConsume: z.number().min(0).max(1).default(0.75),
  taxRate: z.number().min(0).max(1).default(0.25),
  autonomousInvestment: z.number().positive().default(300),
  investmentSensitivity: z.number().positive().default(50),
  governmentSpending: z.number().nonnegative().default(400),
  exports: z.number().nonnegative().default(200),
  importPropensity: z.number().min(0).max(1).default(0.15),
});

const LMParamsSchema = z.object({
  moneySupply: z.number().positive().default(1500),
  priceLevel: z.number().positive().default(1),
  moneyDemandIncomeSensitivity: z.number().positive().default(0.5),
  moneyDemandInterestSensitivity: z.number().positive().default(100),
});

const BOPParamsSchema = z.object({
  worldInterestRate: z.number().min(0).default(5),
  exports: z.number().nonnegative().default(200),
  importPropensity: z.number().min(0).max(1).default(0.15),
  capitalFlowSensitivity: z.number().nonnegative().default(1000),
  capitalMobility: z.enum(['perfect', 'imperfect', 'none']).default('perfect'),
});

const ChartOptionsSchema = z.object({
  yMin: z.number().nonnegative().default(0),
  yMax: z.number().positive().default(5000),
  numPoints: z.number().int().min(10).max(500).default(100),
});

const MundellFlemingRequestSchema = z.object({
  is: ISParamsSchema.optional(),
  lm: LMParamsSchema.optional(),
  bop: BOPParamsSchema.optional(),
  exchangeRateRegime: z.enum(['fixed', 'floating']).default('floating'),
  includeChartData: z.boolean().default(false),
  includeCurves: z.boolean().default(false),
  includeMultipliers: z.boolean().default(false),
  chartOptions: ChartOptionsSchema.optional(),
});

const ISLMRequestSchema = z.object({
  is: ISParamsSchema.optional(),
  lm: LMParamsSchema.optional(),
  includeChartData: z.boolean().default(false),
  chartOptions: ChartOptionsSchema.optional(),
});

const CurvesRequestSchema = z.object({
  is: ISParamsSchema.optional(),
  lm: LMParamsSchema.optional(),
  bop: BOPParamsSchema.optional(),
  curves: z.array(z.enum(['IS', 'LM', 'BOP'])).default(['IS', 'LM', 'BOP']),
  chartOptions: ChartOptionsSchema.optional(),
});

// ============================================================================
// Router Setup
// ============================================================================

export const simulateRouter = Router();

// ============================================================================
// Validation Middleware
// ============================================================================

function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
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
    } catch (error) {
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
simulateRouter.post(
  '/mundell-fleming',
  validateBody(MundellFlemingRequestSchema),
  (req: Request, res: Response) => {
    const {
      is,
      lm,
      bop,
      exchangeRateRegime,
      includeChartData,
      includeCurves,
      includeMultipliers,
      chartOptions,
    } = req.body as z.infer<typeof MundellFlemingRequestSchema>;

    // Use defaults for any missing parameters
    const isParams: ISCurveParams = {
      autonomousConsumption: is?.autonomousConsumption ?? 200,
      marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
      taxRate: is?.taxRate ?? 0.25,
      autonomousInvestment: is?.autonomousInvestment ?? 300,
      investmentSensitivity: is?.investmentSensitivity ?? 50,
      governmentSpending: is?.governmentSpending ?? 400,
      exports: is?.exports ?? 200,
      importPropensity: is?.importPropensity ?? 0.15,
    };

    const lmParams: LMCurveParams = {
      moneySupply: lm?.moneySupply ?? 1500,
      priceLevel: lm?.priceLevel ?? 1,
      moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
      moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };

    const bopParams: BOPCurveParams = {
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
    const equilibrium = calculateMundellFlemingEquilibrium(
      isParams,
      lmParams,
      bopParams,
      exchangeRateRegime
    );

    // Build response
    const response: Record<string, unknown> = {
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
      response.chartData = generateChartData(
        isParams,
        lmParams,
        bopParams,
        opts.yMin,
        opts.yMax,
        opts.numPoints
      );
    }

    // Include individual curves if requested
    if (includeCurves) {
      response.curves = {
        IS: calculateISCurve(isParams, opts.yMin, opts.yMax, opts.numPoints),
        LM: calculateLMCurve(lmParams, opts.yMin, opts.yMax, opts.numPoints),
        BOP: calculateBOPCurve(bopParams, opts.yMin, opts.yMax, opts.numPoints),
      };
    }

    // Include multipliers if requested
    if (includeMultipliers) {
      response.multipliers = {
        fiscal: calculateFiscalMultiplier(isParams, lmParams),
        monetary: calculateMonetaryMultiplier(isParams, lmParams),
      };
    }

    res.json(response);
  }
);

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
simulateRouter.post(
  '/is-lm',
  validateBody(ISLMRequestSchema),
  (req: Request, res: Response) => {
    const { is, lm, includeChartData, chartOptions } = req.body as z.infer<typeof ISLMRequestSchema>;

    const isParams: ISCurveParams = {
      autonomousConsumption: is?.autonomousConsumption ?? 200,
      marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
      taxRate: is?.taxRate ?? 0.25,
      autonomousInvestment: is?.autonomousInvestment ?? 300,
      investmentSensitivity: is?.investmentSensitivity ?? 50,
      governmentSpending: is?.governmentSpending ?? 400,
      exports: is?.exports ?? 200,
      importPropensity: is?.importPropensity ?? 0.15,
    };

    const lmParams: LMCurveParams = {
      moneySupply: lm?.moneySupply ?? 1500,
      priceLevel: lm?.priceLevel ?? 1,
      moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
      moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };

    const equilibrium = calculateISLMEquilibrium(isParams, lmParams);

    const response: Record<string, unknown> = {
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
        IS: calculateISCurve(isParams, opts.yMin, opts.yMax, opts.numPoints),
        LM: calculateLMCurve(lmParams, opts.yMin, opts.yMax, opts.numPoints),
      };
    }

    res.json(response);
  }
);

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
simulateRouter.post(
  '/curves',
  validateBody(CurvesRequestSchema),
  (req: Request, res: Response) => {
    const { is, lm, bop, curves, chartOptions } = req.body as z.infer<typeof CurvesRequestSchema>;

    const opts = {
      yMin: chartOptions?.yMin ?? 0,
      yMax: chartOptions?.yMax ?? 5000,
      numPoints: chartOptions?.numPoints ?? 100,
    };

    const isParams: ISCurveParams = {
      autonomousConsumption: is?.autonomousConsumption ?? 200,
      marginalPropensityConsume: is?.marginalPropensityConsume ?? 0.75,
      taxRate: is?.taxRate ?? 0.25,
      autonomousInvestment: is?.autonomousInvestment ?? 300,
      investmentSensitivity: is?.investmentSensitivity ?? 50,
      governmentSpending: is?.governmentSpending ?? 400,
      exports: is?.exports ?? 200,
      importPropensity: is?.importPropensity ?? 0.15,
    };

    const lmParams: LMCurveParams = {
      moneySupply: lm?.moneySupply ?? 1500,
      priceLevel: lm?.priceLevel ?? 1,
      moneyDemandIncomeSensitivity: lm?.moneyDemandIncomeSensitivity ?? 0.5,
      moneyDemandInterestSensitivity: lm?.moneyDemandInterestSensitivity ?? 100,
    };

    const bopParams: BOPCurveParams = {
      worldInterestRate: bop?.worldInterestRate ?? 5,
      exports: bop?.exports ?? 200,
      importPropensity: bop?.importPropensity ?? 0.15,
      capitalFlowSensitivity: bop?.capitalFlowSensitivity ?? 1000,
      capitalMobility: bop?.capitalMobility ?? 'perfect',
    };

    const response: Record<string, unknown> = {
      params: { is: isParams, lm: lmParams, bop: bopParams },
      curves: {},
    };

    const curvesData = response.curves as Record<string, unknown>;

    if (curves.includes('IS')) {
      curvesData.IS = calculateISCurve(isParams, opts.yMin, opts.yMax, opts.numPoints);
    }

    if (curves.includes('LM')) {
      curvesData.LM = calculateLMCurve(lmParams, opts.yMin, opts.yMax, opts.numPoints);
    }

    if (curves.includes('BOP')) {
      curvesData.BOP = calculateBOPCurve(bopParams, opts.yMin, opts.yMax, opts.numPoints);
    }

    res.json(response);
  }
);

export default simulateRouter;
