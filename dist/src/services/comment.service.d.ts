interface PaginationOptions {
    cursor?: string;
    limit?: number;
    includeReplies?: boolean;
}
export declare const commentService: {
    getCommentsByTask(taskId: string, options?: PaginationOptions): Promise<{
        data: ({
            author: {
                name: string;
                id: string;
                avatar: string | null;
            };
            reactions: ({
                user: {
                    name: string;
                    id: string;
                };
            } & {
                id: string;
                userId: string;
                createdAt: Date;
                commentId: string;
                emoji: string;
            })[];
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
            cursor: string | null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    getCommentById(commentId: string): Promise<{
        task: {
            id: string;
            projectId: string;
            title: string;
        };
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        reactions: ({
            user: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            commentId: string;
            emoji: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    createComment(taskId: string, userId: string, data: {
        content: string;
        parentId?: string;
    }): Promise<{
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        reactions: {
            id: string;
            userId: string;
            createdAt: Date;
            commentId: string;
            emoji: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    updateComment(commentId: string, userId: string, content: string): Promise<{
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        reactions: {
            id: string;
            userId: string;
            createdAt: Date;
            commentId: string;
            emoji: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    deleteComment(commentId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getCommentReplies(commentId: string, options?: PaginationOptions): Promise<{
        data: never[];
        pagination: {
            cursor: null;
            hasMore: boolean;
            limit: number;
        };
    }>;
    addReaction(commentId: string, userId: string, emoji: string): Promise<{
        user: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        commentId: string;
        emoji: string;
    }>;
    removeReaction(commentId: string, userId: string, emoji: string): Promise<{
        success: boolean;
    }>;
    getCommentReactions(commentId: string): Promise<{
        emoji: string;
        count: number;
        users: any[];
    }[]>;
    pinComment(commentId: string, userId: string): Promise<{
        isPinned: boolean;
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    unpinComment(commentId: string, userId: string): Promise<{
        isPinned: boolean;
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    resolveComment(commentId: string, userId: string): Promise<{
        isResolved: boolean;
        resolvedBy: string;
        resolvedAt: Date;
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    unresolveComment(commentId: string, userId: string): Promise<{
        isResolved: boolean;
        resolvedBy: null;
        resolvedAt: null;
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    }>;
    listComments(taskId: string): Promise<({
        author: {
            name: string;
            id: string;
            avatar: string | null;
        };
        reactions: ({
            user: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            userId: string;
            createdAt: Date;
            commentId: string;
            emoji: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        authorId: string;
        content: string;
    })[]>;
};
export default commentService;
//# sourceMappingURL=comment.service.d.ts.map