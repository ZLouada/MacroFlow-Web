"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarioIdParamSchema = exports.simulateSchema = exports.updateScenarioSchema = exports.createScenarioSchema = exports.externalSectorSchema = exports.monetaryPolicySchema = exports.fiscalPolicySchema = void 0;
const zod_1 = require("zod");
// ===========================================
// Scenario Validations
// ===========================================
exports.fiscalPolicySchema = zod_1.z.object({
    governmentSpending: zod_1.z.number().min(0).max(100),
    taxRate: zod_1.z.number().min(0).max(100),
    transferPayments: zod_1.z.number().min(0),
});
exports.monetaryPolicySchema = zod_1.z.object({
    interestRate: zod_1.z.number().min(0).max(50),
    moneySupply: zod_1.z.number().min(0),
    reserveRequirement: zod_1.z.number().min(0).max(100),
});
exports.externalSectorSchema = zod_1.z.object({
    exchangeRate: zod_1.z.number().min(0),
    capitalMobility: zod_1.z.enum(['none', 'low', 'high', 'perfect']),
    exchangeRegime: zod_1.z.enum(['fixed', 'floating']),
    tradeOpenness: zod_1.z.number().min(0).max(100),
});
exports.createScenarioSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    description: zod_1.z.string().max(1000).optional(),
    workspaceId: zod_1.z.string().cuid().optional(),
    fiscalPolicy: exports.fiscalPolicySchema,
    monetaryPolicy: exports.monetaryPolicySchema,
    externalSector: exports.externalSectorSchema,
});
exports.updateScenarioSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(1000).optional().nullable(),
    fiscalPolicy: exports.fiscalPolicySchema.optional(),
    monetaryPolicy: exports.monetaryPolicySchema.optional(),
    externalSector: exports.externalSectorSchema.optional(),
});
exports.simulateSchema = zod_1.z.object({
    fiscalPolicy: exports.fiscalPolicySchema,
    monetaryPolicy: exports.monetaryPolicySchema,
    externalSector: exports.externalSectorSchema,
});
exports.scenarioIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
//# sourceMappingURL=scenario.validation.js.map