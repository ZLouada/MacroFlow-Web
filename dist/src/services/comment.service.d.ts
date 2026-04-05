import { CreateCommentInput, UpdateCommentInput, CreateLabelInput, UpdateLabelInput } from '../validations/comment.validation.js';
export declare const commentService: {
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
        content: string;
        authorId: string;
    })[]>;
    createComment(taskId: string, userId: string, data: CreateCommentInput): Promise<{
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
        content: string;
        authorId: string;
    }>;
    updateComment(commentId: string, userId: string, data: UpdateCommentInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        taskId: string;
        content: string;
        authorId: string;
    }>;
    deleteComment(commentId: string, userId: string): Promise<void>;
    addReaction(commentId: string, userId: string, emoji: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        commentId: string;
        emoji: string;
    }>;
    removeReaction(commentId: string, userId: string, emoji: string): Promise<void>;
};
export declare const labelService: {
    listLabels(workspaceId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }[]>;
    createLabel(workspaceId: string, data: CreateLabelInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    updateLabel(labelId: string, data: UpdateLabelInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        workspaceId: string;
        color: string;
    }>;
    deleteLabel(labelId: string): Promise<void>;
};
declare const _default: {
    commentService: {
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
            content: string;
            authorId: string;
        })[]>;
        createComment(taskId: string, userId: string, data: CreateCommentInput): Promise<{
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
            content: string;
            authorId: string;
        }>;
        updateComment(commentId: string, userId: string, data: UpdateCommentInput): Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            taskId: string;
            content: string;
            authorId: string;
        }>;
        deleteComment(commentId: string, userId: string): Promise<void>;
        addReaction(commentId: string, userId: string, emoji: string): Promise<{
            id: string;
            userId: string;
            createdAt: Date;
            commentId: string;
            emoji: string;
        }>;
        removeReaction(commentId: string, userId: string, emoji: string): Promise<void>;
    };
    labelService: {
        listLabels(workspaceId: string): Promise<{
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }[]>;
        createLabel(workspaceId: string, data: CreateLabelInput): Promise<{
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }>;
        updateLabel(labelId: string, data: UpdateLabelInput): Promise<{
            name: string;
            id: string;
            createdAt: Date;
            workspaceId: string;
            color: string;
        }>;
        deleteLabel(labelId: string): Promise<void>;
    };
};
export default _default;
//# sourceMappingURL=comment.service.d.ts.map