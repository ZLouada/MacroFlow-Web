export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export interface UploadResult {
    key: string;
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
}
export interface PresignedUrlResult {
    uploadUrl: string;
    key: string;
    expiresIn: number;
}
declare class UploadService {
    /**
     * Generate a unique file key with proper folder structure
     */
    private generateFileKey;
    /**
     * Validate file type and size
     */
    private validateFile;
    /**
     * Upload a file to S3
     */
    uploadFile(file: UploadedFile, folder: string, entityId?: string, options?: {
        allowedTypes?: string[];
        maxSize?: number;
        isPublic?: boolean;
    }): Promise<UploadResult>;
    /**
     * Upload multiple files
     */
    uploadFiles(files: UploadedFile[], folder: string, entityId?: string, options?: {
        allowedTypes?: string[];
        maxSize?: number;
        isPublic?: boolean;
    }): Promise<UploadResult[]>;
    /**
     * Upload a user avatar
     */
    uploadAvatar(file: UploadedFile, userId: string): Promise<UploadResult>;
    /**
     * Upload a workspace logo
     */
    uploadWorkspaceLogo(file: UploadedFile, workspaceId: string): Promise<UploadResult>;
    /**
     * Upload a task attachment
     */
    uploadTaskAttachment(file: UploadedFile, taskId: string): Promise<UploadResult>;
    /**
     * Upload a comment attachment
     */
    uploadCommentAttachment(file: UploadedFile, commentId: string): Promise<UploadResult>;
    /**
     * Delete a file from S3
     */
    deleteFile(key: string): Promise<void>;
    /**
     * Delete multiple files
     */
    deleteFiles(keys: string[]): Promise<void>;
    /**
     * Get a signed URL for downloading a private file
     */
    getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Generate a presigned URL for direct upload from client
     */
    getPresignedUploadUrl(folder: string, filename: string, mimeType: string, entityId?: string, expiresIn?: number): Promise<PresignedUrlResult>;
    /**
     * Check if a file exists in S3
     */
    fileExists(key: string): Promise<boolean>;
    /**
     * Get file metadata
     */
    getFileMetadata(key: string): Promise<{
        contentType: string;
        contentLength: number;
        lastModified: Date;
    }>;
    /**
     * Copy a file within S3
     */
    copyFile(sourceKey: string, destinationFolder: string): Promise<string>;
}
export declare const uploadService: UploadService;
export {};
//# sourceMappingURL=upload.service.d.ts.map