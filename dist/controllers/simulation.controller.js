"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationController = void 0;
const simulation_service_1 = require("../services/simulation.service");
const errors_1 = require("../utils/errors");
exports.simulationController = {
    /**
     * Create a new economic scenario
     * POST /api/v1/workspaces/:workspaceId/scenarios
     */
    async create(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { workspaceId } = req.params;
            const scenario = await simulation_service_1.simulationService.createScenario(workspaceId, req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Scenario created successfully',
                data: scenario,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get all scenarios for workspace
     * GET /api/v1/workspaces/:workspaceId/scenarios
     */
    async getAll(req, res, next) {
        try {
            const { workspaceId } = req.params;
            const { cursor, limit, status } = req.query;
            const result = await simulation_service_1.simulationService.getScenarios(workspaceId, {
                cursor: cursor,
                limit: limit ? parseInt(limit, 10) : undefined,
                status: status,
            });
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get scenario by ID
     * GET /api/v1/scenarios/:scenarioId
     */
    async getById(req, res, next) {
        try {
            const { scenarioId } = req.params;
            const scenario = await simulation_service_1.simulationService.getScenarioById(scenarioId);
            res.json({
                success: true,
                data: scenario,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Update scenario
     * PATCH /api/v1/scenarios/:scenarioId
     */
    async update(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { scenarioId } = req.params;
            const scenario = await simulation_service_1.simulationService.updateScenario(scenarioId, req.user.id, req.body);
            res.json({
                success: true,
                message: 'Scenario updated successfully',
                data: scenario,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Delete scenario
     * DELETE /api/v1/scenarios/:scenarioId
     */
    async delete(req, res, next) {
        try {
            const { scenarioId } = req.params;
            await simulation_service_1.simulationService.deleteScenario(scenarioId);
            res.json({
                success: true,
                message: 'Scenario deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Run Mundell-Fleming simulation
     * POST /api/v1/scenarios/:scenarioId/simulate
     */
    async runSimulation(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { scenarioId } = req.params;
            const result = await simulation_service_1.simulationService.runSimulation(scenarioId, req.user.id);
            res.json({
                success: true,
                message: 'Simulation completed successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get simulation results
     * GET /api/v1/scenarios/:scenarioId/results
     */
    async getResults(req, res, next) {
        try {
            const { scenarioId } = req.params;
            const results = await simulation_service_1.simulationService.getSimulationResults(scenarioId);
            res.json({
                success: true,
                data: results,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Compare multiple scenarios
     * POST /api/v1/scenarios/compare
     */
    async compare(req, res, next) {
        try {
            const { scenarioIds } = req.body;
            if (!scenarioIds || scenarioIds.length < 2) {
                throw new errors_1.AppError('At least 2 scenarios are required for comparison', 400);
            }
            const comparison = await simulation_service_1.simulationService.compareScenarios(scenarioIds);
            res.json({
                success: true,
                data: comparison,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Duplicate scenario
     * POST /api/v1/scenarios/:scenarioId/duplicate
     */
    async duplicate(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { scenarioId } = req.params;
            const { name } = req.body;
            const scenario = await simulation_service_1.simulationService.duplicateScenario(scenarioId, req.user.id, name);
            res.status(201).json({
                success: true,
                message: 'Scenario duplicated successfully',
                data: scenario,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Export scenario data
     * GET /api/v1/scenarios/:scenarioId/export
     */
    async export(req, res, next) {
        try {
            const { scenarioId } = req.params;
            const { format } = req.query;
            const exportData = await simulation_service_1.simulationService.exportScenario(scenarioId, format || 'json');
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=scenario-${scenarioId}.csv`);
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=scenario-${scenarioId}.json`);
            }
            res.send(exportData);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get available economic models
     * GET /api/v1/simulations/models
     */
    async getModels(req, res, next) {
        try {
            const models = simulation_service_1.simulationService.getAvailableModels();
            res.json({
                success: true,
                data: models,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get model parameters schema
     * GET /api/v1/simulations/models/:modelId/schema
     */
    async getModelSchema(req, res, next) {
        try {
            const { modelId } = req.params;
            const schema = simulation_service_1.simulationService.getModelSchema(modelId);
            res.json({
                success: true,
                data: schema,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Run sensitivity analysis
     * POST /api/v1/scenarios/:scenarioId/sensitivity
     */
    async sensitivityAnalysis(req, res, next) {
        try {
            if (!req.user?.id) {
                throw new errors_1.AppError('User not authenticated', 401);
            }
            const { scenarioId } = req.params;
            const { parameter, range } = req.body;
            const result = await simulation_service_1.simulationService.runSensitivityAnalysis(scenarioId, req.user.id, {
                parameter,
                range,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Get historical data for calibration
     * GET /api/v1/simulations/historical-data
     */
    async getHistoricalData(req, res, next) {
        try {
            const { country, startYear, endYear, indicators } = req.query;
            const data = await simulation_service_1.simulationService.getHistoricalData({
                country: country,
                startYear: startYear ? parseInt(startYear, 10) : undefined,
                endYear: endYear ? parseInt(endYear, 10) : undefined,
                indicators: indicators ? indicators.split(',') : undefined,
            });
            res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=simulation.controller.js.map