import { SimulationResult, FiscalPolicy, MonetaryPolicy } from '../types/index.js';
import { CreateScenarioInput, UpdateScenarioInput, SimulateInput } from '../validations/scenario.validation.js';
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
};
export declare const scenarioService: {
    listScenarios(userId: string, workspaceId?: string): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
        monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
        externalSector: import("@prisma/client/runtime/library").JsonValue;
        indicators: import("@prisma/client/runtime/library").JsonValue | null;
        results: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    createScenario(userId: string, data: CreateScenarioInput): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
        monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
        externalSector: import("@prisma/client/runtime/library").JsonValue;
        indicators: import("@prisma/client/runtime/library").JsonValue | null;
        results: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getScenario(scenarioId: string, userId: string): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
        monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
        externalSector: import("@prisma/client/runtime/library").JsonValue;
        indicators: import("@prisma/client/runtime/library").JsonValue | null;
        results: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateScenario(scenarioId: string, userId: string, data: UpdateScenarioInput): Promise<{
        name: string;
        id: string;
        userId: string;
        createdAt: Date;
        workspaceId: string | null;
        updatedAt: Date;
        description: string | null;
        fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
        monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
        externalSector: import("@prisma/client/runtime/library").JsonValue;
        indicators: import("@prisma/client/runtime/library").JsonValue | null;
        results: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteScenario(scenarioId: string, userId: string): Promise<void>;
};
declare const _default: {
    simulationService: {
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
    };
    scenarioService: {
        listScenarios(userId: string, workspaceId?: string): Promise<{
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            updatedAt: Date;
            description: string | null;
            fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
            monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
            externalSector: import("@prisma/client/runtime/library").JsonValue;
            indicators: import("@prisma/client/runtime/library").JsonValue | null;
            results: import("@prisma/client/runtime/library").JsonValue | null;
        }[]>;
        createScenario(userId: string, data: CreateScenarioInput): Promise<{
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            updatedAt: Date;
            description: string | null;
            fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
            monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
            externalSector: import("@prisma/client/runtime/library").JsonValue;
            indicators: import("@prisma/client/runtime/library").JsonValue | null;
            results: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        getScenario(scenarioId: string, userId: string): Promise<{
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            updatedAt: Date;
            description: string | null;
            fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
            monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
            externalSector: import("@prisma/client/runtime/library").JsonValue;
            indicators: import("@prisma/client/runtime/library").JsonValue | null;
            results: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        updateScenario(scenarioId: string, userId: string, data: UpdateScenarioInput): Promise<{
            name: string;
            id: string;
            userId: string;
            createdAt: Date;
            workspaceId: string | null;
            updatedAt: Date;
            description: string | null;
            fiscalPolicy: import("@prisma/client/runtime/library").JsonValue;
            monetaryPolicy: import("@prisma/client/runtime/library").JsonValue;
            externalSector: import("@prisma/client/runtime/library").JsonValue;
            indicators: import("@prisma/client/runtime/library").JsonValue | null;
            results: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        deleteScenario(scenarioId: string, userId: string): Promise<void>;
    };
};
export default _default;
//# sourceMappingURL=simulation.service.d.ts.map