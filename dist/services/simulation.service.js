"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioService = exports.simulationService = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
// ===========================================
// Economic Simulation Service
// ===========================================
// Mundell-Fleming Model Constants
const DEFAULT_PARAMS = {
    c0: 100, // Autonomous consumption
    c1: 0.8, // Marginal propensity to consume
    t: 0.25, // Tax rate
    b0: 50, // Autonomous investment
    b1: 500, // Interest rate sensitivity of investment
    m0: 50, // Autonomous imports
    m1: 0.1, // Marginal propensity to import
    x0: 100, // Autonomous exports
    k: 0.5, // Income sensitivity of money demand
    h: 1000, // Interest rate sensitivity of money demand
    f: 1000, // Capital mobility parameter
};
// ===========================================
// Simulation Functions
// ===========================================
function calculateISCurve(params, yRange) {
    const points = [];
    const { governmentSpending, taxRate } = params;
    const G = governmentSpending;
    const t = taxRate / 100;
    const intercept = (DEFAULT_PARAMS.c0 + DEFAULT_PARAMS.b0 + G + DEFAULT_PARAMS.x0 - DEFAULT_PARAMS.m0) / DEFAULT_PARAMS.b1;
    const slope = -((1 - DEFAULT_PARAMS.c1 * (1 - t) + DEFAULT_PARAMS.m1) / DEFAULT_PARAMS.b1);
    for (let y = yRange[0]; y <= yRange[1]; y += 50) {
        points.push({ x: y, y: intercept + slope * y });
    }
    return points;
}
function calculateLMCurve(params, yRange) {
    const points = [];
    const { moneySupply } = params;
    const M = moneySupply;
    const P = 1; // Price level normalized
    const slope = DEFAULT_PARAMS.k / DEFAULT_PARAMS.h;
    const intercept = -M / (DEFAULT_PARAMS.h * P);
    for (let y = yRange[0]; y <= yRange[1]; y += 50) {
        points.push({ x: y, y: intercept + slope * y });
    }
    return points;
}
function calculateBPCurve(params, yRange) {
    const points = [];
    const { capitalMobility } = params;
    let slope = 0;
    switch (capitalMobility) {
        case 'none':
            slope = Infinity;
            break;
        case 'low':
            slope = 2;
            break;
        case 'high':
            slope = 0.5;
            break;
        case 'perfect':
            slope = 0;
            break;
    }
    const rWorld = 5;
    if (capitalMobility === 'perfect') {
        for (let y = yRange[0]; y <= yRange[1]; y += 50) {
            points.push({ x: y, y: rWorld });
        }
    }
    else if (capitalMobility === 'none') {
        const yEquilibrium = 500;
        for (let r = 0; r <= 20; r += 1) {
            points.push({ x: yEquilibrium, y: r });
        }
    }
    else {
        for (let y = yRange[0]; y <= yRange[1]; y += 50) {
            points.push({ x: y, y: rWorld + slope * (y - 500) / 1000 });
        }
    }
    return points;
}
function findEquilibrium(fiscal, monetary, external) {
    const G = fiscal.governmentSpending;
    const t = fiscal.taxRate / 100;
    const M = monetary.moneySupply;
    const multiplier = 1 / (1 - DEFAULT_PARAMS.c1 * (1 - t) + DEFAULT_PARAMS.m1 +
        (DEFAULT_PARAMS.b1 * DEFAULT_PARAMS.k) / DEFAULT_PARAMS.h);
    const income = multiplier * (DEFAULT_PARAMS.c0 + DEFAULT_PARAMS.b0 + G + DEFAULT_PARAMS.x0 - DEFAULT_PARAMS.m0 +
        (DEFAULT_PARAMS.b1 * M) / DEFAULT_PARAMS.h);
    const interestRate = (DEFAULT_PARAMS.k * income - M) / DEFAULT_PARAMS.h;
    let exchangeRate = external.exchangeRate;
    if (external.exchangeRegime === 'floating') {
        exchangeRate = external.exchangeRate * (1 + (interestRate - 5) * 0.05);
    }
    return {
        income: Math.round(income * 100) / 100,
        interestRate: Math.round(interestRate * 100) / 100,
        exchangeRate: Math.round(exchangeRate * 100) / 100,
    };
}
function generateAnalysis(equilibrium, external) {
    const analysis = [];
    if (equilibrium.income > 800) {
        analysis.push('Economy is operating above potential output - inflationary pressures may build');
    }
    else if (equilibrium.income < 400) {
        analysis.push('Economy is in recession - stimulative policies may be needed');
    }
    else {
        analysis.push('Economy is operating near potential output');
    }
    if (equilibrium.interestRate > 8) {
        analysis.push('High interest rates may crowd out private investment');
    }
    else if (equilibrium.interestRate < 2) {
        analysis.push('Low interest rates support investment but may fuel asset bubbles');
    }
    if (external.exchangeRegime === 'fixed') {
        analysis.push('Under fixed exchange rates, monetary policy effectiveness is limited');
    }
    else {
        analysis.push('Under floating exchange rates, fiscal policy effectiveness is reduced');
    }
    if (external.capitalMobility === 'perfect') {
        analysis.push('Perfect capital mobility leads to rapid interest rate equalization');
    }
    return analysis;
}
// ===========================================
// Simulation Service (combined)
// ===========================================
exports.simulationService = {
    // Full Mundell-Fleming simulation
    simulate(data) {
        const yRange = [0, 1500];
        const curves = {
            is: calculateISCurve(data.fiscalPolicy, yRange),
            lm: calculateLMCurve(data.monetaryPolicy, yRange),
            bp: calculateBPCurve(data.externalSector, yRange),
        };
        const equilibrium = findEquilibrium(data.fiscalPolicy, data.monetaryPolicy, data.externalSector);
        const analysis = generateAnalysis(equilibrium, data.externalSector);
        const indicators = {
            gdp: equilibrium.income * 10,
            inflation: equilibrium.interestRate > 6 ? 4 + (equilibrium.interestRate - 6) : 2,
            unemployment: Math.max(3, 12 - equilibrium.income / 100),
            interestRate: equilibrium.interestRate,
            exchangeRate: equilibrium.exchangeRate,
            tradeBalance: (1 - data.externalSector.tradeOpenness / 100) * (data.externalSector.exchangeRate - 1) * 100,
        };
        return {
            equilibrium,
            curves,
            indicators,
            analysis,
        };
    },
    // IS-LM only simulation
    simulateISLM(fiscal, monetary) {
        const yRange = [0, 1500];
        return {
            is: calculateISCurve(fiscal, yRange),
            lm: calculateLMCurve(monetary, yRange),
            equilibrium: findEquilibrium(fiscal, monetary, {
                exchangeRate: 1,
                capitalMobility: 'high',
                exchangeRegime: 'floating',
                tradeOpenness: 50,
            }),
        };
    },
    // Generate curves only
    generateCurves(data) {
        const yRange = [0, 1500];
        return {
            is: calculateISCurve(data.fiscalPolicy, yRange),
            lm: calculateLMCurve(data.monetaryPolicy, yRange),
            bp: calculateBPCurve(data.externalSector, yRange),
        };
    },
    // ===========================================
    // Scenario CRUD Methods
    // ===========================================
    // Create scenario
    async createScenario(workspaceId, userId, data) {
        const results = this.simulate({
            fiscalPolicy: data.fiscalPolicy,
            monetaryPolicy: data.monetaryPolicy,
            externalSector: data.externalSector,
        });
        const scenario = await database_1.prisma.scenario.create({
            data: {
                userId,
                workspaceId,
                name: data.name,
                description: data.description,
                fiscalPolicy: data.fiscalPolicy,
                monetaryPolicy: data.monetaryPolicy,
                externalSector: data.externalSector,
                indicators: results.indicators,
                results: results,
            },
        });
        return scenario;
    },
    // Get scenarios with pagination
    async getScenarios(workspaceId, params = {}) {
        const { cursor, limit = 20, status } = params;
        const scenarios = await database_1.prisma.scenario.findMany({
            where: {
                workspaceId,
                // Add status filter if schema supports it
            },
            orderBy: { updatedAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        });
        const hasNext = scenarios.length > limit;
        if (hasNext)
            scenarios.pop();
        const nextCursor = hasNext ? scenarios[scenarios.length - 1]?.id : undefined;
        return {
            data: scenarios,
            pagination: { hasNext, nextCursor, limit },
        };
    },
    // Get scenario by ID
    async getScenarioById(scenarioId) {
        const scenario = await database_1.prisma.scenario.findUnique({
            where: { id: scenarioId },
        });
        if (!scenario) {
            throw new errors_1.NotFoundError('Scenario not found');
        }
        return scenario;
    },
    // Get scenario (alias with user check)
    async getScenario(scenarioId, userId) {
        const scenario = await database_1.prisma.scenario.findFirst({
            where: { id: scenarioId, userId },
        });
        if (!scenario) {
            throw new errors_1.NotFoundError('Scenario not found');
        }
        return scenario;
    },
    // Update scenario
    async updateScenario(scenarioId, userId, data) {
        const scenario = await database_1.prisma.scenario.findFirst({
            where: { id: scenarioId, userId },
        });
        if (!scenario) {
            throw new errors_1.NotFoundError('Scenario not found');
        }
        let results = scenario.results;
        if (data.fiscalPolicy || data.monetaryPolicy || data.externalSector) {
            const simulationInput = {
                fiscalPolicy: data.fiscalPolicy || scenario.fiscalPolicy,
                monetaryPolicy: data.monetaryPolicy || scenario.monetaryPolicy,
                externalSector: data.externalSector || scenario.externalSector,
            };
            results = this.simulate(simulationInput);
        }
        const updated = await database_1.prisma.scenario.update({
            where: { id: scenarioId },
            data: {
                ...data,
                fiscalPolicy: data.fiscalPolicy,
                monetaryPolicy: data.monetaryPolicy,
                externalSector: data.externalSector,
                results: results,
                indicators: results.indicators,
            },
        });
        return updated;
    },
    // Delete scenario
    async deleteScenario(scenarioId, userId) {
        const where = userId ? { id: scenarioId, userId } : { id: scenarioId };
        const scenario = await database_1.prisma.scenario.findFirst({ where });
        if (!scenario) {
            throw new errors_1.NotFoundError('Scenario not found');
        }
        await database_1.prisma.scenario.delete({
            where: { id: scenarioId },
        });
    },
    // Run simulation for a scenario
    async runSimulation(scenarioId, userId) {
        const scenario = await this.getScenario(scenarioId, userId);
        const results = this.simulate({
            fiscalPolicy: scenario.fiscalPolicy,
            monetaryPolicy: scenario.monetaryPolicy,
            externalSector: scenario.externalSector,
        });
        // Update scenario with new results
        await database_1.prisma.scenario.update({
            where: { id: scenarioId },
            data: {
                results: results,
                indicators: results.indicators,
            },
        });
        return results;
    },
    // Get simulation results for a scenario
    async getSimulationResults(scenarioId) {
        const scenario = await this.getScenarioById(scenarioId);
        return scenario.results;
    },
    // Compare multiple scenarios
    async compareScenarios(scenarioIds) {
        const scenarios = await database_1.prisma.scenario.findMany({
            where: { id: { in: scenarioIds } },
        });
        if (scenarios.length < 2) {
            throw new errors_1.NotFoundError('Need at least 2 scenarios to compare');
        }
        return {
            scenarios: scenarios.map(s => ({
                id: s.id,
                name: s.name,
                indicators: s.indicators,
                equilibrium: s.results?.equilibrium,
            })),
            comparison: {
                gdpDifference: this.calculateDifference(scenarios, 'gdp'),
                inflationDifference: this.calculateDifference(scenarios, 'inflation'),
                unemploymentDifference: this.calculateDifference(scenarios, 'unemployment'),
            },
        };
    },
    // Helper to calculate differences
    calculateDifference(scenarios, indicator) {
        const values = scenarios.map(s => {
            const indicators = s.indicators;
            return indicators?.[indicator] || 0;
        });
        return Math.max(...values) - Math.min(...values);
    },
    // Duplicate scenario
    async duplicateScenario(scenarioId, userId, newName) {
        const scenario = await this.getScenarioById(scenarioId);
        const duplicate = await database_1.prisma.scenario.create({
            data: {
                userId,
                workspaceId: scenario.workspaceId,
                name: newName || `${scenario.name} (Copy)`,
                description: scenario.description,
                fiscalPolicy: scenario.fiscalPolicy,
                monetaryPolicy: scenario.monetaryPolicy,
                externalSector: scenario.externalSector,
                indicators: scenario.indicators,
                results: scenario.results,
            },
        });
        return duplicate;
    },
    // Export scenario
    async exportScenario(scenarioId, format = 'json') {
        const scenario = await this.getScenarioById(scenarioId);
        if (format === 'csv') {
            const indicators = scenario.indicators;
            const headers = ['name', ...Object.keys(indicators || {})];
            const values = [scenario.name, ...Object.values(indicators || {})];
            return `${headers.join(',')}\n${values.join(',')}`;
        }
        return JSON.stringify({
            name: scenario.name,
            description: scenario.description,
            fiscalPolicy: scenario.fiscalPolicy,
            monetaryPolicy: scenario.monetaryPolicy,
            externalSector: scenario.externalSector,
            indicators: scenario.indicators,
            results: scenario.results,
        }, null, 2);
    },
    // Get available economic models
    getAvailableModels() {
        return [
            {
                id: 'mundell-fleming',
                name: 'Mundell-Fleming Model',
                description: 'Open economy IS-LM-BP model for analyzing fiscal and monetary policy effects',
                parameters: ['fiscalPolicy', 'monetaryPolicy', 'externalSector'],
            },
            {
                id: 'is-lm',
                name: 'IS-LM Model',
                description: 'Closed economy model for analyzing fiscal and monetary policy effects',
                parameters: ['fiscalPolicy', 'monetaryPolicy'],
            },
        ];
    },
    // Get model schema
    getModelSchema(modelId) {
        const schemas = {
            'mundell-fleming': {
                fiscalPolicy: {
                    governmentSpending: { type: 'number', min: 0, max: 1000, description: 'Government spending (G)' },
                    taxRate: { type: 'number', min: 0, max: 100, description: 'Tax rate (%)' },
                    transferPayments: { type: 'number', min: 0, max: 500, description: 'Transfer payments' },
                },
                monetaryPolicy: {
                    interestRate: { type: 'number', min: 0, max: 20, description: 'Interest rate (%)' },
                    moneySupply: { type: 'number', min: 0, max: 5000, description: 'Money supply (M)' },
                    reserveRequirement: { type: 'number', min: 0, max: 100, description: 'Reserve requirement (%)' },
                },
                externalSector: {
                    exchangeRate: { type: 'number', min: 0.1, max: 10, description: 'Exchange rate' },
                    capitalMobility: { type: 'enum', values: ['none', 'low', 'high', 'perfect'], description: 'Capital mobility' },
                    exchangeRegime: { type: 'enum', values: ['fixed', 'floating'], description: 'Exchange regime' },
                    tradeOpenness: { type: 'number', min: 0, max: 100, description: 'Trade openness (%)' },
                },
            },
            'is-lm': {
                fiscalPolicy: {
                    governmentSpending: { type: 'number', min: 0, max: 1000, description: 'Government spending (G)' },
                    taxRate: { type: 'number', min: 0, max: 100, description: 'Tax rate (%)' },
                },
                monetaryPolicy: {
                    interestRate: { type: 'number', min: 0, max: 20, description: 'Interest rate (%)' },
                    moneySupply: { type: 'number', min: 0, max: 5000, description: 'Money supply (M)' },
                },
            },
        };
        const schema = schemas[modelId];
        if (!schema) {
            throw new errors_1.NotFoundError('Model not found');
        }
        return schema;
    },
    // Run sensitivity analysis
    async runSensitivityAnalysis(scenarioId, userId, options) {
        const scenario = await this.getScenario(scenarioId, userId);
        const results = [];
        const { parameter, range } = options;
        const step = (range.max - range.min) / range.steps;
        for (let value = range.min; value <= range.max; value += step) {
            // Create modified policy based on parameter
            const modifiedFiscal = { ...scenario.fiscalPolicy };
            const modifiedMonetary = { ...scenario.monetaryPolicy };
            if (parameter === 'governmentSpending')
                modifiedFiscal.governmentSpending = value;
            if (parameter === 'taxRate')
                modifiedFiscal.taxRate = value;
            if (parameter === 'interestRate')
                modifiedMonetary.interestRate = value;
            if (parameter === 'moneySupply')
                modifiedMonetary.moneySupply = value;
            const simResult = this.simulate({
                fiscalPolicy: modifiedFiscal,
                monetaryPolicy: modifiedMonetary,
                externalSector: scenario.externalSector,
            });
            results.push({ value, indicators: simResult.indicators });
        }
        return {
            parameter,
            range,
            results,
        };
    },
    // Get historical data (mock data for now)
    async getHistoricalData(options) {
        const { country = 'USA', startYear = 2010, endYear = 2023, indicators = ['gdp', 'inflation', 'unemployment'] } = options;
        // Mock historical data
        const data = [];
        for (let year = startYear; year <= endYear; year++) {
            const entry = { year };
            if (indicators.includes('gdp'))
                entry.gdp = 15000 + (year - 2010) * 500 + Math.random() * 200;
            if (indicators.includes('inflation'))
                entry.inflation = 2 + Math.random() * 2;
            if (indicators.includes('unemployment'))
                entry.unemployment = 4 + Math.random() * 4;
            if (indicators.includes('interestRate'))
                entry.interestRate = 1 + Math.random() * 4;
            data.push(entry);
        }
        return {
            country,
            indicators,
            data,
        };
    },
};
// Keep scenarioService as alias for backward compatibility
exports.scenarioService = {
    listScenarios: async (userId, workspaceId) => {
        const scenarios = await database_1.prisma.scenario.findMany({
            where: {
                userId,
                ...(workspaceId && { workspaceId }),
            },
            orderBy: { updatedAt: 'desc' },
        });
        return scenarios;
    },
    createScenario: exports.simulationService.createScenario.bind(exports.simulationService),
    getScenario: exports.simulationService.getScenario.bind(exports.simulationService),
    updateScenario: exports.simulationService.updateScenario.bind(exports.simulationService),
    deleteScenario: exports.simulationService.deleteScenario.bind(exports.simulationService),
};
exports.default = exports.simulationService;
//# sourceMappingURL=simulation.service.js.map