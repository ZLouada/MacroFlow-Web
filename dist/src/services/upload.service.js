"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../utils/errors.js");
const logger_js_1 = require("../utils/logger.js");
// S3 client configuration
const s3Client = new client_s3_1.S3Client({
    region: index_js_1.config.s3.region,
    endpoint: index_js_1.config.s3.endpoint || undefined,
    credentials: index_js_1.config.s3.accessKey && index_js_1.config.s3.secretKey ? {
        accessKeyId: index_js_1.config.s3.accessKey,
        secretAccessKey: index_js_1.config.s3.secretKey,
    } : undefined,
    forcePathStyle: !!index_js_1.config.s3.endpoint, // Required for S3-compatible services like MinIO
});
const BUCKET_NAME = index_js_1.config.s3.bucket || 'macroflow-uploads';
// Allowed file types and size limits
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
];
const ALLOWED_ARCHIVE_TYPES = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_ARCHIVE_TYPES];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
class UploadService {
    /**
     * Generate a unique file key with proper folder structure
     */
    generateFileKey(folder, originalName, entityId) {
        const ext = path_1.default.extname(originalName);
        const uniqueId = (0, uuid_1.v4)();
        const timestamp = Date.now();
        if (entityId) {
            return `${folder}/${entityId}/${timestamp}-${uniqueId}${ext}`;
        }
        return `${folder}/${timestamp}-${uniqueId}${ext}`;
    }
    /**
     * Validate file type and size
     */
    validateFile(file, options = {}) {
        const { allowedTypes = ALL_ALLOWED_TYPES, maxSize = MAX_FILE_SIZE } = options;
        if (!allowedTypes.includes(file.mimetype)) {
            throw new errors_js_1.BadRequestError(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`, 'INVALID_FILE_TYPE');
        }
        if (file.size > maxSize) {
            throw new errors_js_1.BadRequestError(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`, 'FILE_TOO_LARGE');
        }
    }
    /**
     * Upload a file to S3
     */
    async uploadFile(file, folder, entityId, options = {}) {
        this.validateFile(file, options);
        const key = this.generateFileKey(folder, file.originalname, entityId);
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: options.isPublic ? 'public-read' : 'private',
                Metadata: {
                    originalName: encodeURIComponent(file.originalname),
                },
            });
            await s3Client.send(command);
            const url = options.isPublic
                ? `${index_js_1.config.s3.endpoint || `https://${BUCKET_NAME}.s3.${index_js_1.config.s3.region}.amazonaws.com`}/${key}`
                : await this.getSignedDownloadUrl(key);
            logger_js_1.logger.info('File uploaded successfully', { key, size: file.size });
            return {
                key,
                url,
                filename: path_1.default.basename(key),
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to upload file to S3', { error, key });
            throw new errors_js_1.InternalServerError('Failed to upload file', 'UPLOAD_FAILED');
        }
    }
    /**
     * Upload multiple files
     */
    async uploadFiles(files, folder, entityId, options = {}) {
        const results = await Promise.all(files.map((file) => this.uploadFile(file, folder, entityId, options)));
        return results;
    }
    /**
     * Upload a user avatar
     */
    async uploadAvatar(file, userId) {
        return this.uploadFile(file, 'avatars', userId, {
            allowedTypes: ALLOWED_IMAGE_TYPES,
            maxSize: MAX_IMAGE_SIZE,
            isPublic: true,
        });
    }
    /**
     * Upload a workspace logo
     */
    async uploadWorkspaceLogo(file, workspaceId) {
        return this.uploadFile(file, 'workspaces/logos', workspaceId, {
            allowedTypes: ALLOWED_IMAGE_TYPES,
            maxSize: MAX_IMAGE_SIZE,
            isPublic: true,
        });
    }
    /**
     * Upload a task attachment
     */
    async uploadTaskAttachment(file, taskId) {
        return this.uploadFile(file, 'tasks/attachments', taskId, {
            allowedTypes: ALL_ALLOWED_TYPES,
            maxSize: MAX_FILE_SIZE,
            isPublic: false,
        });
    }
    /**
     * Upload a comment attachment
     */
    async uploadCommentAttachment(file, commentId) {
        return this.uploadFile(file, 'comments/attachments', commentId, {
            allowedTypes: ALL_ALLOWED_TYPES,
            maxSize: MAX_FILE_SIZE,
            isPublic: false,
        });
    }
    /**
     * Delete a file from S3
     */
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            await s3Client.send(command);
            logger_js_1.logger.info('File deleted successfully', { key });
        }
        catch (error) {
            logger_js_1.logger.error('Failed to delete file from S3', { error, key });
            throw new errors_js_1.InternalServerError('Failed to delete file', 'DELETE_FAILED');
        }
    }
    /**
     * Delete multiple files
     */
    async deleteFiles(keys) {
        await Promise.all(keys.map((key) => this.deleteFile(key)));
    }
    /**
     * Get a signed URL for downloading a private file
     */
    async getSignedDownloadUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
            return url;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to generate signed download URL', { error, key });
            throw new errors_js_1.InternalServerError('Failed to generate download URL', 'URL_GENERATION_FAILED');
        }
    }
    /**
     * Generate a presigned URL for direct upload from client
     */
    async getPresignedUploadUrl(folder, filename, mimeType, entityId, expiresIn = 3600) {
        // Validate mime type
        if (!ALL_ALLOWED_TYPES.includes(mimeType)) {
            throw new errors_js_1.BadRequestError(`File type ${mimeType} is not allowed`, 'INVALID_FILE_TYPE');
        }
        const key = this.generateFileKey(folder, filename, entityId);
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: mimeType,
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
            return {
                uploadUrl,
                key,
                expiresIn,
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to generate presigned upload URL', { error, key });
            throw new errors_js_1.InternalServerError('Failed to generate upload URL', 'URL_GENERATION_FAILED');
        }
    }
    /**
     * Check if a file exists in S3
     */
    async fileExists(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            await s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    /**
     * Get file metadata
     */
    async getFileMetadata(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            const response = await s3Client.send(command);
            return {
                contentType: response.ContentType || 'application/octet-stream',
                contentLength: response.ContentLength || 0,
                lastModified: response.LastModified || new Date(),
            };
        }
        catch (error) {
            logger_js_1.logger.error('Failed to get file metadata', { error, key });
            throw new errors_js_1.NotFoundError('File not found', 'FILE_NOT_FOUND');
        }
    }
    /**
     * Copy a file within S3
     */
    async copyFile(sourceKey, destinationFolder) {
        const filename = path_1.default.basename(sourceKey);
        const destinationKey = `${destinationFolder}/${(0, uuid_1.v4)()}-${filename}`;
        try {
            const command = new client_s3_1.CopyObjectCommand({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${sourceKey}`,
                Key: destinationKey,
            });
            await s3Client.send(command);
            logger_js_1.logger.info('File copied successfully', { sourceKey, destinationKey });
            return destinationKey;
        }
        catch (error) {
            logger_js_1.logger.error('Failed to copy file', { error, sourceKey, destinationKey });
            throw new errors_js_1.InternalServerError('Failed to copy file', 'COPY_FAILED');
        }
    }
}
exports.uploadService = new UploadService();
//# sourceMappingURL=upload.service.js.map