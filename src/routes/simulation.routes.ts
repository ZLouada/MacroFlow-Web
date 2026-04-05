import { Router } from 'express';
import { simulationController } from '../controllers/simulation.controller';
import { validate, asyncHandler } from '../middleware/error.middleware';
import { authenticate, requireWorkspaceAccess } from '../middleware/auth.middleware';
import {
  createScenarioSchema,
  updateScenarioSchema,
  simulateSchema,
} from '../validations/scenario.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ===========================================
// Simulation Endpoints
// ===========================================

/**
 * @route   POST /api/v1/simulations/run
 * @desc    Run a simulation without saving
 * @access  Private
 */
router.post(
  '/run',
  validate({ body: simulateSchema }),
  asyncHandler(simulationController.runSimulation)
);

/**
 * @route   GET /api/v1/simulations/models
 * @desc    Get available economic models
 * @access  Private
 */
router.get(
  '/models',
  asyncHandler(simulationController.getModels)
);

/**
 * @route   GET /api/v1/simulations/models/:modelId/schema
 * @desc    Get model parameters schema
 * @access  Private
 */
router.get(
  '/models/:modelId/schema',
  asyncHandler(simulationController.getModelSchema)
);

/**
 * @route   GET /api/v1/simulations/historical-data
 * @desc    Get historical data for calibration
 * @access  Private
 */
router.get(
  '/historical-data',
  asyncHandler(simulationController.getHistoricalData)
);

// ===========================================
// Scenario CRUD
// ===========================================

/**
 * @route   GET /api/v1/simulations/scenarios
 * @desc    List user's scenarios
 * @access  Private
 */
router.get(
  '/scenarios',
  asyncHandler(simulationController.getAll)
);

/**
 * @route   POST /api/v1/simulations/scenarios
 * @desc    Create and save a scenario
 * @access  Private
 */
router.post(
  '/scenarios',
  validate({ body: createScenarioSchema }),
  asyncHandler(simulationController.create)
);

/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId
 * @desc    Get scenario details
 * @access  Private
 */
router.get(
  '/scenarios/:scenarioId',
  asyncHandler(simulationController.getById)
);

/**
 * @route   PATCH /api/v1/simulations/scenarios/:scenarioId
 * @desc    Update scenario
 * @access  Private
 */
router.patch(
  '/scenarios/:scenarioId',
  validate({ body: updateScenarioSchema }),
  asyncHandler(simulationController.update)
);

/**
 * @route   DELETE /api/v1/simulations/scenarios/:scenarioId
 * @desc    Delete scenario
 * @access  Private
 */
router.delete(
  '/scenarios/:scenarioId',
  asyncHandler(simulationController.delete)
);

/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/run
 * @desc    Re-run simulation for a scenario
 * @access  Private
 */
router.post(
  '/scenarios/:scenarioId/run',
  asyncHandler(simulationController.runSimulation)
);

/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId/results
 * @desc    Get simulation results for a scenario
 * @access  Private
 */
router.get(
  '/scenarios/:scenarioId/results',
  asyncHandler(simulationController.getResults)
);

/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/duplicate
 * @desc    Duplicate a scenario
 * @access  Private
 */
router.post(
  '/scenarios/:scenarioId/duplicate',
  asyncHandler(simulationController.duplicate)
);

/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/sensitivity
 * @desc    Run sensitivity analysis
 * @access  Private
 */
router.post(
  '/scenarios/:scenarioId/sensitivity',
  asyncHandler(simulationController.sensitivityAnalysis)
);

// ===========================================
// Workspace Scenarios
// ===========================================

/**
 * @route   GET /api/v1/workspaces/:workspaceId/simulations/scenarios
 * @desc    List scenarios in workspace
 * @access  Private (Workspace Member)
 */
router.get(
  '/workspaces/:workspaceId/scenarios',
  requireWorkspaceAccess(),
  asyncHandler(simulationController.getAll)
);

// ===========================================
// Comparison & Export
// ===========================================

/**
 * @route   POST /api/v1/simulations/compare
 * @desc    Compare multiple scenarios
 * @access  Private
 */
router.post(
  '/compare',
  asyncHandler(simulationController.compare)
);

/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId/export
 * @desc    Export scenario data
 * @access  Private
 */
router.get(
  '/scenarios/:scenarioId/export',
  asyncHandler(simulationController.export)
);

export default router;
