import { z } from 'zod';

// ===========================================
// Scenario Validations
// ===========================================

export const fiscalPolicySchema = z.object({
  governmentSpending: z.number().min(0).max(100),
  taxRate: z.number().min(0).max(100),
  transferPayments: z.number().min(0),
});

export const monetaryPolicySchema = z.object({
  interestRate: z.number().min(0).max(50),
  moneySupply: z.number().min(0),
  reserveRequirement: z.number().min(0).max(100),
});

export const externalSectorSchema = z.object({
  exchangeRate: z.number().min(0),
  capitalMobility: z.enum(['none', 'low', 'high', 'perfect']),
  exchangeRegime: z.enum(['fixed', 'floating']),
  tradeOpenness: z.number().min(0).max(100),
});

export const createScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).optional(),
  workspaceId: z.string().cuid().optional(),
  fiscalPolicy: fiscalPolicySchema,
  monetaryPolicy: monetaryPolicySchema,
  externalSector: externalSectorSchema,
});

export const updateScenarioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  fiscalPolicy: fiscalPolicySchema.optional(),
  monetaryPolicy: monetaryPolicySchema.optional(),
  externalSector: externalSectorSchema.optional(),
});

export const simulateSchema = z.object({
  fiscalPolicy: fiscalPolicySchema,
  monetaryPolicy: monetaryPolicySchema,
  externalSector: externalSectorSchema,
});

export const scenarioIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type FiscalPolicyInput = z.infer<typeof fiscalPolicySchema>;
export type MonetaryPolicyInput = z.infer<typeof monetaryPolicySchema>;
export type ExternalSectorInput = z.infer<typeof externalSectorSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
export type SimulateInput = z.infer<typeof simulateSchema>;
