"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioService = exports.simulationService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
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
    // IS: r = (c0 + b0 + G + x0 - m0) / b1 - ((1 - c1*(1-t) + m1) / b1) * Y
    const intercept = (DEFAULT_PARAMS.c0 + DEFAULT_PARAMS.b0 + G + DEFAULT_PARAMS.x0 - DEFAULT_PARAMS.m0) / DEFAULT_PARAMS.b1;
    const slope = -((1 - DEFAULT_PARAMS.c1 * (1 - t) + DEFAULT_PARAMS.m1) / DEFAULT_PARAMS.b1);
    for (let y = yRange[0]; y <= yRange[1]; y += 50) {
        points.push({ x: y, y: intercept + slope * y });
    }
    return points;
}
function calculateLMCurve(params, yRange) {
    const points = [];
    const { moneySupply, interestRate: targetRate } = params;
    const M = moneySupply;
    const P = 1; // Price level normalized
    // LM: r = (k/h)*Y - M/(h*P)
    const slope = DEFAULT_PARAMS.k / DEFAULT_PARAMS.h;
    const intercept = -M / (DEFAULT_PARAMS.h * P);
    for (let y = yRange[0]; y <= yRange[1]; y += 50) {
        points.push({ x: y, y: intercept + slope * y });
    }
    return points;
}
function calculateBPCurve(params, yRange) {
    const points = [];
    const { capitalMobility, exchangeRate } = params;
    // BP curve slope depends on capital mobility
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
    // World interest rate
    const rWorld = 5;
    if (capitalMobility === 'perfect') {
        // Horizontal BP curve
        for (let y = yRange[0]; y <= yRange[1]; y += 50) {
            points.push({ x: y, y: rWorld });
        }
    }
    else if (capitalMobility === 'none') {
        // Would be vertical - approximate with steep slope
        const yEquilibrium = 500;
        for (let r = 0; r <= 20; r += 1) {
            points.push({ x: yEquilibrium, y: r });
        }
    }
    else {
        // Normal upward sloping BP curve
        for (let y = yRange[0]; y <= yRange[1]; y += 50) {
            points.push({ x: y, y: rWorld + slope * (y - 500) / 1000 });
        }
    }
    return points;
}
function findEquilibrium(fiscal, monetary, external) {
    // Simplified equilibrium calculation
    const G = fiscal.governmentSpending;
    const t = fiscal.taxRate / 100;
    const M = monetary.moneySupply;
    // IS-LM equilibrium
    const multiplier = 1 / (1 - DEFAULT_PARAMS.c1 * (1 - t) + DEFAULT_PARAMS.m1 +
        (DEFAULT_PARAMS.b1 * DEFAULT_PARAMS.k) / DEFAULT_PARAMS.h);
    const income = multiplier * (DEFAULT_PARAMS.c0 + DEFAULT_PARAMS.b0 + G + DEFAULT_PARAMS.x0 - DEFAULT_PARAMS.m0 +
        (DEFAULT_PARAMS.b1 * M) / DEFAULT_PARAMS.h);
    const interestRate = (DEFAULT_PARAMS.k * income - M) / DEFAULT_PARAMS.h;
    // Exchange rate adjustment
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
    // Income analysis
    if (equilibrium.income > 800) {
        analysis.push('Economy is operating above potential output - inflationary pressures may build');
    }
    else if (equilibrium.income < 400) {
        analysis.push('Economy is in recession - stimulative policies may be needed');
    }
    else {
        analysis.push('Economy is operating near potential output');
    }
    // Interest rate analysis
    if (equilibrium.interestRate > 8) {
        analysis.push('High interest rates may crowd out private investment');
    }
    else if (equilibrium.interestRate < 2) {
        analysis.push('Low interest rates support investment but may fuel asset bubbles');
    }
    // Exchange regime analysis
    if (external.exchangeRegime === 'fixed') {
        analysis.push('Under fixed exchange rates, monetary policy effectiveness is limited');
    }
    else {
        analysis.push('Under floating exchange rates, fiscal policy effectiveness is reduced');
    }
    // Capital mobility analysis
    if (external.capitalMobility === 'perfect') {
        analysis.push('Perfect capital mobility leads to rapid interest rate equalization');
    }
    return analysis;
}
// ===========================================
// Scenario Service
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
        // Calculate indicators
        const indicators = {
            gdp: equilibrium.income * 10, // Scale to billions
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
    // IS-LM only
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
};
// ===========================================
// Scenario CRUD Service
// ===========================================
exports.scenarioService = {
    // List scenarios
    async listScenarios(userId, workspaceId) {
        const scenarios = await database_js_1.prisma.scenario.findMany({
            where: {
                userId,
                ...(workspaceId && { workspaceId }),
            },
            orderBy: { updatedAt: 'desc' },
        });
        return scenarios;
    },
    // Create scenario
    async createScenario(userId, data) {
        // Run simulation
        const results = exports.simulationService.simulate({
            fiscalPolicy: data.fiscalPolicy,
            monetaryPolicy: data.monetaryPolicy,
            externalSector: data.externalSector,
        });
        const scenario = await database_js_1.prisma.scenario.create({
            data: {
                userId,
                workspaceId: data.workspaceId,
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
    // Get scenario
    async getScenario(scenarioId, userId) {
        const scenario = await database_js_1.prisma.scenario.findFirst({
            where: { id: scenarioId, userId },
        });
        if (!scenario) {
            throw new errors_js_1.NotFoundError('Scenario not found');
        }
        return scenario;
    },
    // Update scenario
    async updateScenario(scenarioId, userId, data) {
        const scenario = await database_js_1.prisma.scenario.findFirst({
            where: { id: scenarioId, userId },
        });
        if (!scenario) {
            throw new errors_js_1.NotFoundError('Scenario not found');
        }
        // Re-run simulation if policies changed
        let results = scenario.results;
        if (data.fiscalPolicy || data.monetaryPolicy || data.externalSector) {
            const simulationInput = {
                fiscalPolicy: data.fiscalPolicy || scenario.fiscalPolicy,
                monetaryPolicy: data.monetaryPolicy || scenario.monetaryPolicy,
                externalSector: data.externalSector || scenario.externalSector,
            };
            results = exports.simulationService.simulate(simulationInput);
        }
        const updated = await database_js_1.prisma.scenario.update({
            where: { id: scenarioId },
            data: {
                ...data,
                results,
                indicators: results.indicators,
            },
        });
        return updated;
    },
    // Delete scenario
    async deleteScenario(scenarioId, userId) {
        const scenario = await database_js_1.prisma.scenario.findFirst({
            where: { id: scenarioId, userId },
        });
        if (!scenario) {
            throw new errors_js_1.NotFoundError('Scenario not found');
        }
        await database_js_1.prisma.scenario.delete({
            where: { id: scenarioId },
        });
    },
};
exports.default = { simulationService: exports.simulationService, scenarioService: exports.scenarioService };
//# sourceMappingURL=simulation.service.js.map