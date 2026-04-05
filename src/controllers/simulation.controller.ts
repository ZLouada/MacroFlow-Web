import { Response, NextFunction } from 'express';
import { simulationService } from '../services/simulation.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/errors';

export const simulationController = {
  /**
   * Create a new economic scenario
   * POST /api/v1/workspaces/:workspaceId/scenarios
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { workspaceId } = req.params;

      const scenario = await simulationService.createScenario(workspaceId, req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Scenario created successfully',
        data: scenario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all scenarios for workspace
   * GET /api/v1/workspaces/:workspaceId/scenarios
   */
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { cursor, limit, status } = req.query;

      const result = await simulationService.getScenarios(workspaceId, {
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        status: status as string | undefined,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get scenario by ID
   * GET /api/v1/scenarios/:scenarioId
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;

      const scenario = await simulationService.getScenarioById(scenarioId);

      res.json({
        success: true,
        data: scenario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update scenario
   * PATCH /api/v1/scenarios/:scenarioId
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { scenarioId } = req.params;

      const scenario = await simulationService.updateScenario(scenarioId, req.user.id, req.body);

      res.json({
        success: true,
        message: 'Scenario updated successfully',
        data: scenario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete scenario
   * DELETE /api/v1/scenarios/:scenarioId
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;

      await simulationService.deleteScenario(scenarioId);

      res.json({
        success: true,
        message: 'Scenario deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Run Mundell-Fleming simulation
   * POST /api/v1/scenarios/:scenarioId/simulate
   */
  async runSimulation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { scenarioId } = req.params;

      const result = await simulationService.runSimulation(scenarioId, req.user.id);

      res.json({
        success: true,
        message: 'Simulation completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get simulation results
   * GET /api/v1/scenarios/:scenarioId/results
   */
  async getResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;

      const results = await simulationService.getSimulationResults(scenarioId);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Compare multiple scenarios
   * POST /api/v1/scenarios/compare
   */
  async compare(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { scenarioIds } = req.body;

      if (!scenarioIds || scenarioIds.length < 2) {
        throw new AppError('At least 2 scenarios are required for comparison', 400);
      }

      const comparison = await simulationService.compareScenarios(scenarioIds);

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Duplicate scenario
   * POST /api/v1/scenarios/:scenarioId/duplicate
   */
  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { scenarioId } = req.params;
      const { name } = req.body;

      const scenario = await simulationService.duplicateScenario(scenarioId, req.user.id, name);

      res.status(201).json({
        success: true,
        message: 'Scenario duplicated successfully',
        data: scenario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export scenario data
   * GET /api/v1/scenarios/:scenarioId/export
   */
  async export(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { scenarioId } = req.params;
      const { format } = req.query;

      const exportData = await simulationService.exportScenario(
        scenarioId,
        (format as 'json' | 'csv') || 'json'
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=scenario-${scenarioId}.csv`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=scenario-${scenarioId}.json`);
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get available economic models
   * GET /api/v1/simulations/models
   */
  async getModels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const models = simulationService.getAvailableModels();

      res.json({
        success: true,
        data: models,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get model parameters schema
   * GET /api/v1/simulations/models/:modelId/schema
   */
  async getModelSchema(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { modelId } = req.params;

      const schema = simulationService.getModelSchema(modelId);

      res.json({
        success: true,
        data: schema,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Run sensitivity analysis
   * POST /api/v1/scenarios/:scenarioId/sensitivity
   */
  async sensitivityAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('User not authenticated', 401);
      }

      const { scenarioId } = req.params;
      const { parameter, range } = req.body;

      const result = await simulationService.runSensitivityAnalysis(scenarioId, req.user.id, {
        parameter,
        range,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get historical data for calibration
   * GET /api/v1/simulations/historical-data
   */
  async getHistoricalData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { country, startYear, endYear, indicators } = req.query;

      const data = await simulationService.getHistoricalData({
        country: country as string,
        startYear: startYear ? parseInt(startYear as string, 10) : undefined,
        endYear: endYear ? parseInt(endYear as string, 10) : undefined,
        indicators: indicators ? (indicators as string).split(',') : undefined,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
