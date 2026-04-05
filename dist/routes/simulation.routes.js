"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulation_controller_js_1 = require("../controllers/simulation.controller.js");
const error_middleware_js_1 = require("../middleware/error.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const scenario_validation_js_1 = require("../validations/scenario.validation.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authenticate);
// ===========================================
// Simulation Endpoints
// ===========================================
/**
 * @route   POST /api/v1/simulations/run
 * @desc    Run a simulation without saving
 * @access  Private
 */
router.post('/run', (0, error_middleware_js_1.validate)(scenario_validation_js_1.simulateSchema), (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.runSimulation));
/**
 * @route   GET /api/v1/simulations/models
 * @desc    Get available economic models
 * @access  Private
 */
router.get('/models', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getModels));
/**
 * @route   GET /api/v1/simulations/models/:modelId/schema
 * @desc    Get model parameters schema
 * @access  Private
 */
router.get('/models/:modelId/schema', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getModelSchema));
/**
 * @route   GET /api/v1/simulations/historical-data
 * @desc    Get historical data for calibration
 * @access  Private
 */
router.get('/historical-data', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getHistoricalData));
// ===========================================
// Scenario CRUD
// ===========================================
/**
 * @route   GET /api/v1/simulations/scenarios
 * @desc    List user's scenarios
 * @access  Private
 */
router.get('/scenarios', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getAll));
/**
 * @route   POST /api/v1/simulations/scenarios
 * @desc    Create and save a scenario
 * @access  Private
 */
router.post('/scenarios', (0, error_middleware_js_1.validate)(scenario_validation_js_1.createScenarioSchema), (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.create));
/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId
 * @desc    Get scenario details
 * @access  Private
 */
router.get('/scenarios/:scenarioId', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getById));
/**
 * @route   PATCH /api/v1/simulations/scenarios/:scenarioId
 * @desc    Update scenario
 * @access  Private
 */
router.patch('/scenarios/:scenarioId', (0, error_middleware_js_1.validate)(scenario_validation_js_1.updateScenarioSchema), (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.update));
/**
 * @route   DELETE /api/v1/simulations/scenarios/:scenarioId
 * @desc    Delete scenario
 * @access  Private
 */
router.delete('/scenarios/:scenarioId', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.delete));
/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/run
 * @desc    Re-run simulation for a scenario
 * @access  Private
 */
router.post('/scenarios/:scenarioId/run', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.runSimulation));
/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId/results
 * @desc    Get simulation results for a scenario
 * @access  Private
 */
router.get('/scenarios/:scenarioId/results', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getResults));
/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/duplicate
 * @desc    Duplicate a scenario
 * @access  Private
 */
router.post('/scenarios/:scenarioId/duplicate', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.duplicate));
/**
 * @route   POST /api/v1/simulations/scenarios/:scenarioId/sensitivity
 * @desc    Run sensitivity analysis
 * @access  Private
 */
router.post('/scenarios/:scenarioId/sensitivity', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.sensitivityAnalysis));
// ===========================================
// Workspace Scenarios
// ===========================================
/**
 * @route   GET /api/v1/workspaces/:workspaceId/simulations/scenarios
 * @desc    List scenarios in workspace
 * @access  Private (Workspace Member)
 */
router.get('/workspaces/:workspaceId/scenarios', (0, auth_middleware_js_1.requireWorkspaceAccess)(), (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.getAll));
// ===========================================
// Comparison & Export
// ===========================================
/**
 * @route   POST /api/v1/simulations/compare
 * @desc    Compare multiple scenarios
 * @access  Private
 */
router.post('/compare', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.compare));
/**
 * @route   GET /api/v1/simulations/scenarios/:scenarioId/export
 * @desc    Export scenario data
 * @access  Private
 */
router.get('/scenarios/:scenarioId/export', (0, error_middleware_js_1.asyncHandler)(simulation_controller_js_1.simulationController.export));
exports.default = router;
//# sourceMappingURL=simulation.routes.js.map