import { z } from 'zod';
export declare const fiscalPolicySchema: z.ZodObject<{
    governmentSpending: z.ZodNumber;
    taxRate: z.ZodNumber;
    transferPayments: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    governmentSpending: number;
    taxRate: number;
    transferPayments: number;
}, {
    governmentSpending: number;
    taxRate: number;
    transferPayments: number;
}>;
export declare const monetaryPolicySchema: z.ZodObject<{
    interestRate: z.ZodNumber;
    moneySupply: z.ZodNumber;
    reserveRequirement: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    interestRate: number;
    moneySupply: number;
    reserveRequirement: number;
}, {
    interestRate: number;
    moneySupply: number;
    reserveRequirement: number;
}>;
export declare const externalSectorSchema: z.ZodObject<{
    exchangeRate: z.ZodNumber;
    capitalMobility: z.ZodEnum<["none", "low", "high", "perfect"]>;
    exchangeRegime: z.ZodEnum<["fixed", "floating"]>;
    tradeOpenness: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    exchangeRate: number;
    capitalMobility: "low" | "high" | "none" | "perfect";
    exchangeRegime: "fixed" | "floating";
    tradeOpenness: number;
}, {
    exchangeRate: number;
    capitalMobility: "low" | "high" | "none" | "perfect";
    exchangeRegime: "fixed" | "floating";
    tradeOpenness: number;
}>;
export declare const createScenarioSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    fiscalPolicy: z.ZodObject<{
        governmentSpending: z.ZodNumber;
        taxRate: z.ZodNumber;
        transferPayments: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }>;
    monetaryPolicy: z.ZodObject<{
        interestRate: z.ZodNumber;
        moneySupply: z.ZodNumber;
        reserveRequirement: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }>;
    externalSector: z.ZodObject<{
        exchangeRate: z.ZodNumber;
        capitalMobility: z.ZodEnum<["none", "low", "high", "perfect"]>;
        exchangeRegime: z.ZodEnum<["fixed", "floating"]>;
        tradeOpenness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    fiscalPolicy: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    };
    monetaryPolicy: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    };
    externalSector: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    };
    workspaceId?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    fiscalPolicy: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    };
    monetaryPolicy: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    };
    externalSector: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    };
    workspaceId?: string | undefined;
    description?: string | undefined;
}>;
export declare const updateScenarioSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fiscalPolicy: z.ZodOptional<z.ZodObject<{
        governmentSpending: z.ZodNumber;
        taxRate: z.ZodNumber;
        transferPayments: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }>>;
    monetaryPolicy: z.ZodOptional<z.ZodObject<{
        interestRate: z.ZodNumber;
        moneySupply: z.ZodNumber;
        reserveRequirement: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }>>;
    externalSector: z.ZodOptional<z.ZodObject<{
        exchangeRate: z.ZodNumber;
        capitalMobility: z.ZodEnum<["none", "low", "high", "perfect"]>;
        exchangeRegime: z.ZodEnum<["fixed", "floating"]>;
        tradeOpenness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    fiscalPolicy?: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    } | undefined;
    monetaryPolicy?: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    } | undefined;
    externalSector?: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    } | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    fiscalPolicy?: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    } | undefined;
    monetaryPolicy?: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    } | undefined;
    externalSector?: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    } | undefined;
}>;
export declare const simulateSchema: z.ZodObject<{
    fiscalPolicy: z.ZodObject<{
        governmentSpending: z.ZodNumber;
        taxRate: z.ZodNumber;
        transferPayments: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }, {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    }>;
    monetaryPolicy: z.ZodObject<{
        interestRate: z.ZodNumber;
        moneySupply: z.ZodNumber;
        reserveRequirement: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }, {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    }>;
    externalSector: z.ZodObject<{
        exchangeRate: z.ZodNumber;
        capitalMobility: z.ZodEnum<["none", "low", "high", "perfect"]>;
        exchangeRegime: z.ZodEnum<["fixed", "floating"]>;
        tradeOpenness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }, {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    }>;
}, "strip", z.ZodTypeAny, {
    fiscalPolicy: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    };
    monetaryPolicy: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    };
    externalSector: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    };
}, {
    fiscalPolicy: {
        governmentSpending: number;
        taxRate: number;
        transferPayments: number;
    };
    monetaryPolicy: {
        interestRate: number;
        moneySupply: number;
        reserveRequirement: number;
    };
    externalSector: {
        exchangeRate: number;
        capitalMobility: "low" | "high" | "none" | "perfect";
        exchangeRegime: "fixed" | "floating";
        tradeOpenness: number;
    };
}>;
export declare const scenarioIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type FiscalPolicyInput = z.infer<typeof fiscalPolicySchema>;
export type MonetaryPolicyInput = z.infer<typeof monetaryPolicySchema>;
export type ExternalSectorInput = z.infer<typeof externalSectorSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type UpdateScenarioInput = z.infer<typeof updateScenarioSchema>;
export type SimulateInput = z.infer<typeof simulateSchema>;
//# sourceMappingURL=scenario.validation.d.ts.map