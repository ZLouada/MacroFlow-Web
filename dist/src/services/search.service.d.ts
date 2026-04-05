interface SearchParams {
    query: string;
    type?: 'task' | 'project' | 'user' | 'all';
    workspaceId?: string;
    limit?: number;
}
export declare const searchService: {
    search(userId: string, params: SearchParams): Promise<{
        tasks: unknown[];
        projects: unknown[];
        users: unknown[];
    }>;
    quickSearch(userId: string, query: string, workspaceId?: string): Promise<{
        tasks: unknown[];
        projects: unknown[];
        users: unknown[];
    }>;
};
export default searchService;
//# sourceMappingURL=search.service.d.ts.map