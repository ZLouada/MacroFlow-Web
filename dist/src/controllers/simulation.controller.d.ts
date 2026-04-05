import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare const simulationController: {
    /**
     * Create a new economic scenario
     * POST /api/v1/workspaces/:workspaceId/scenarios
     */
    create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all scenarios for workspace
     * GET /api/v1/workspaces/:workspaceId/scenarios
     */
    getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get scenario by ID
     * GET /api/v1/scenarios/:scenarioId
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update scenario
     * PATCH /api/v1/scenarios/:scenarioId
     */
    update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete scenario
     * DELETE /api/v1/scenarios/:scenarioId
     */
    delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Run Mundell-Fleming simulation
     * POST /api/v1/scenarios/:scenarioId/simulate
     */
    runSimulation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get simulation results
     * GET /api/v1/scenarios/:scenarioId/results
     */
    getResults(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Compare multiple scenarios
     * POST /api/v1/scenarios/compare
     */
    compare(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Duplicate scenario
     * POST /api/v1/scenarios/:scenarioId/duplicate
     */
    duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export scenario data
     * GET /api/v1/scenarios/:scenarioId/export
     */
    export(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get available economic models
     * GET /api/v1/simulations/models
     */
    getModels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get model parameters schema
     * GET /api/v1/simulations/models/:modelId/schema
     */
    getModelSchema(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Run sensitivity analysis
     * POST /api/v1/scenarios/:scenarioId/sensitivity
     */
    sensitivityAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get historical data for calibration
     * GET /api/v1/simulations/historical-data
     */
    getHistoricalData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=simulation.controller.d.ts.map