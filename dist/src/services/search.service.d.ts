interface GlobalSearchParams {
    query: string;
    types?: string[];
    workspaceId?: string;
    limit?: number;
}
interface TaskSearchParams {
    query?: string;
    workspaceId?: string;
    projectId?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    labels?: string[];
    dueBefore?: string;
    dueAfter?: string;
    cursor?: string;
    limit?: number;
}
interface ProjectSearchParams {
    query?: string;
    workspaceId?: string;
    status?: string;
    cursor?: string;
    limit?: number;
}
interface UserSearchParams {
    query: string;
    workspaceId?: string;
    limit?: number;
}
interface CommentSearchParams {
    query: string;
    workspaceId?: string;
    projectId?: string;
    taskId?: string;
    cursor?: string;
    limit?: number;
}
interface SuggestionParams {
    query: string;
    types?: string[];
    workspaceId?: string;
    limit?: number;
}
interface SaveSearchParams {
    name: string;
    query: string;
    filters?: Record<string, unknown>;
}
interface AdvancedSearchParams {
    query?: string;
    types?: string[];
    workspaceId?: string;
    projectId?: string;
    filters?: {
        status?: string[];
        priority?: string[];
        assigneeId?: string[];
        labels?: string[];
        dateRange?: {
            field: string;
            from?: string;
            to?: string;
        };
    };
    sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    cursor?: string;
    limit?: number;
}
interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters: Record<string, unknown>;
    createdAt: Date;
}
export declare const searchService: {
    getUserWorkspaceIds(userId: string, workspaceId?: string): Promise<string[]>;
    globalSearch(userId: string, params: GlobalSearchParams): Promise<{
        tasks: unknown[];
        projects: unknown[];
        users: unknown[];
    }>;
    searchTasks(userId: string, params: TaskSearchParams): Promise<{
        data: ({
            project: {
                name: string;
                id: string;
                workspaceId: string;
            };
            labels: ({
                label: {
                    name: string;
                    id: string;
                    color: string;
                };
            } & {
                id: string;
                createdAt: Date;
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                name: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            description: string | null;
            startDate: Date | null;
            endDate: Date | null;
            createdBy: string;
            priority: import(".prisma/client").$Enums.TaskPriority;
            dueDate: Date | null;
            columnId: string;
            title: string;
            assigneeId: string | null;
            order: number;
            estimatedHours: number | null;
            actualHours: number | null;
            progress: number;
            isMilestone: boolean;
        })[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
    }>;
    searchProjects(userId: string, params: ProjectSearchParams): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            workspace: {
                name: string;
                id: string;
            };
            tasksCount: number;
            membersCount: number;
            updatedAt: Date;
        }[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
    }>;
    searchUsers(userId: string, params: UserSearchParams): Promise<{
        name: string;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        avatar: string | null;
    }[]>;
    searchComments(userId: string, params: CommentSearchParams): Promise<{
        data: ({
            task: {
                id: string;
                title: string;
            };
            author: {
                name: string;
                id: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            taskId: string;
            authorId: string;
            content: string;
        })[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
    }>;
    getSuggestions(userId: string, params: SuggestionParams): Promise<{
        id: string;
        type: string;
        text: string;
        subtext?: string;
    }[]>;
    trackRecentSearch(userId: string, query: string): Promise<void>;
    getRecentSearches(userId: string, params?: {
        limit?: number;
    }): Promise<{
        id: string;
        query: string;
    }[]>;
    clearRecentSearches(userId: string): Promise<void>;
    saveSearch(userId: string, params: SaveSearchParams): Promise<SavedSearch>;
    getSavedSearches(userId: string): Promise<SavedSearch[]>;
    deleteSavedSearch(userId: string, searchId: string): Promise<void>;
    advancedSearch(userId: string, params: AdvancedSearchParams): Promise<{
        data: ({
            project: {
                name: string;
                id: string;
                workspaceId: string;
            };
            labels: ({
                label: {
                    name: string;
                    id: string;
                    color: string;
                };
            } & {
                id: string;
                createdAt: Date;
                taskId: string;
                labelId: string;
            })[];
            assignee: {
                name: string;
                id: string;
                avatar: string | null;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.TaskStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            projectId: string;
            description: string | null;
            startDate: Date | null;
            endDate: Date | null;
            createdBy: string;
            priority: import(".prisma/client").$Enums.TaskPriority;
            dueDate: Date | null;
            columnId: string;
            title: string;
            assigneeId: string | null;
            order: number;
            estimatedHours: number | null;
            actualHours: number | null;
            progress: number;
            isMilestone: boolean;
        })[];
        pagination: {
            hasNext: boolean;
            nextCursor: string | undefined;
            limit: number;
        };
        facets: {
            status: {
                value: import(".prisma/client").$Enums.TaskStatus;
                count: number;
            }[];
            priority: {
                value: import(".prisma/client").$Enums.TaskPriority;
                count: number;
            }[];
        };
    }>;
};
export default searchService;
//# sourceMappingURL=search.service.d.ts.map