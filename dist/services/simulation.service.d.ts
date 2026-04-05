import { Prisma } from '@prisma/client';
import { SimulationResult, FiscalPolicy, MonetaryPolicy, EconomicIndicators } from '../types';
import { CreateScenarioInput, UpdateScenarioInput, SimulateInput } from '../validations/scenario.validation';
export declare const simulationService: {
    simulate(data: SimulateInput): SimulationResult;
    simulateISLM(fiscal: FiscalPolicy, monetary: MonetaryPolicy): {
        is: {
            x: number;
            y: number;
        }[];
        lm: {
            x: number;
            y: number;
        }[];
        equilibrium: {
            income: number;
            interestRate: number;
            exchangeRate: number;
        };
    };
    generateCurves(data: SimulateInput): {
        is: {
            x: number;
            y: number;
        }[];
        lm: {
            x: number;
            y: number;
        }[];
        bp: {
            x: number;
            y: number;
        }[];
    };
    createScenario(workspaceId: string, userId: string, data: CreateScenarioInput): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    getScenarios(workspaceId: string, params?: {
        cursor?: string;
        limit?: number;
        status?: string;
    }): Promise<{
        data: {
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            updatedAt: Date;
            description: string | null;
            fiscalPolicy: Prisma.JsonValue;
            monetaryPolicy: Prisma.JsonValue;
            externalSector: Prisma.JsonValue;
            indicators: Prisma.JsonValue | null;
            results: Prisma.JsonValue | null;
        }[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
    }>;
    getScenarioById(scenarioId: string): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    getScenario(scenarioId: string, userId: string): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    updateScenario(scenarioId: string, userId: string, data: UpdateScenarioInput): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    deleteScenario(scenarioId: string, userId?: string): Promise<void>;
    runSimulation(scenarioId: string, userId: string): Promise<SimulationResult>;
    getSimulationResults(scenarioId: string): Promise<SimulationResult>;
    compareScenarios(scenarioIds: string[]): Promise<{
        scenarios: {
            id: string;
            name: string;
            indicators: Prisma.JsonValue;
            equilibrium: unknown;
        }[];
        comparison: {
            gdpDifference: number;
            inflationDifference: number;
            unemploymentDifference: number;
        };
    }>;
    calculateDifference(scenarios: Array<{
        indicators: Prisma.JsonValue;
    }>, indicator: string): number;
    duplicateScenario(scenarioId: string, userId: string, newName?: string): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    exportScenario(scenarioId: string, format?: "json" | "csv"): Promise<string>;
    getAvailableModels(): {
        id: string;
        name: string;
        description: string;
        parameters: string[];
    }[];
    getModelSchema(modelId: string): {};
    runSensitivityAnalysis(scenarioId: string, userId: string, options: {
        parameter: string;
        range: {
            min: number;
            max: number;
            steps: number;
        };
    }): Promise<{
        parameter: string;
        range: {
            min: number;
            max: number;
            steps: number;
        };
        results: {
            value: number;
            indicators: EconomicIndicators;
        }[];
    }>;
    getHistoricalData(options: {
        country?: string;
        startYear?: number;
        endYear?: number;
        indicators?: string[];
    }): Promise<{
        country: string;
        indicators: string[];
        data: {
            [key: string]: number;
            year: number;
        }[];
    }>;
};
export declare const scenarioService: {
    listScenarios: (userId: string, workspaceId?: string) => Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }[]>;
    createScenario: (workspaceId: string, userId: string, data: CreateScenarioInput) => Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    getScenario: (scenarioId: string, userId: string) => Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    updateScenario: (scenarioId: string, userId: string, data: UpdateScenarioInput) => Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: Prisma.JsonValue;
        monetaryPolicy: Prisma.JsonValue;
        externalSector: Prisma.JsonValue;
        indicators: Prisma.JsonValue | null;
        results: Prisma.JsonValue | null;
    }>;
    deleteScenario: (scenarioId: string, userId?: string) => Promise<void>;
};
export default simulationService;
//# sourceMappingURL=simulation.service.d.ts.map