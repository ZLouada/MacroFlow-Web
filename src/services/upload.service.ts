import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { config } from '../config/index';
import { BadRequestError, NotFoundError, InternalServerError } from '../utils/errors';
import { logger } from '../utils/logger';

// S3 client configuration
const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint || undefined,
  credentials: config.s3.accessKey && config.s3.secretKey ? {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  } : undefined,
  forcePathStyle: !!config.s3.endpoint, // Required for S3-compatible services like MinIO
});

const BUCKET_NAME = config.s3.bucket || 'macroflow-uploads';

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

class UploadService {
  /**
   * Generate a unique file key with proper folder structure
   */
  private generateFileKey(
    folder: string,
    originalName: string,
    entityId?: string
  ): string {
    const ext = path.extname(originalName);
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    
    if (entityId) {
      return `${folder}/${entityId}/${timestamp}-${uniqueId}${ext}`;
    }
    return `${folder}/${timestamp}-${uniqueId}${ext}`;
  }

  /**
   * Validate file type and size
   */
  private validateFile(
    file: UploadedFile,
    options: {
      allowedTypes?: string[];
      maxSize?: number;
    } = {}
  ): void {
    const { allowedTypes = ALL_ALLOWED_TYPES, maxSize = MAX_FILE_SIZE } = options;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestError(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        'INVALID_FILE_TYPE'
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestError(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
        'FILE_TOO_LARGE'
      );
    }
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: UploadedFile,
    folder: string,
    entityId?: string,
    options: {
      allowedTypes?: string[];
      maxSize?: number;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadResult> {
    this.validateFile(file, options);

    const key = this.generateFileKey(folder, file.originalname, entityId);

    try {
      const command = new PutObjectCommand({
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
        ? `${config.s3.endpoint || `https://${BUCKET_NAME}.s3.${config.s3.region}.amazonaws.com`}/${key}`
        : await this.getSignedDownloadUrl(key);

      logger.info('File uploaded successfully', { key, size: file.size });

      return {
        key,
        url,
        filename: path.basename(key),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      logger.error('Failed to upload file to S3', { error, key });
      throw new InternalServerError('Failed to upload file', 'UPLOAD_FAILED');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: UploadedFile[],
    folder: string,
    entityId?: string,
    options: {
      allowedTypes?: string[];
      maxSize?: number;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadResult[]> {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, folder, entityId, options))
    );
    return results;
  }

  /**
   * Upload a user avatar
   */
  async uploadAvatar(file: UploadedFile, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'avatars', userId, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      maxSize: MAX_IMAGE_SIZE,
      isPublic: true,
    });
  }

  /**
   * Upload a workspace logo
   */
  async uploadWorkspaceLogo(file: UploadedFile, workspaceId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'workspaces/logos', workspaceId, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      maxSize: MAX_IMAGE_SIZE,
      isPublic: true,
    });
  }

  /**
   * Upload a task attachment
   */
  async uploadTaskAttachment(file: UploadedFile, taskId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'tasks/attachments', taskId, {
      allowedTypes: ALL_ALLOWED_TYPES,
      maxSize: MAX_FILE_SIZE,
      isPublic: false,
    });
  }

  /**
   * Upload a comment attachment
   */
  async uploadCommentAttachment(file: UploadedFile, commentId: string): Promise<UploadResult> {
    return this.uploadFile(file, 'comments/attachments', commentId, {
      allowedTypes: ALL_ALLOWED_TYPES,
      maxSize: MAX_FILE_SIZE,
      isPublic: false,
    });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      logger.info('File deleted successfully', { key });
    } catch (error) {
      logger.error('Failed to delete file from S3', { error, key });
      throw new InternalServerError('Failed to delete file', 'DELETE_FAILED');
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteFile(key)));
  }

  /**
   * Get a signed URL for downloading a private file
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('Failed to generate signed download URL', { error, key });
      throw new InternalServerError('Failed to generate download URL', 'URL_GENERATION_FAILED');
    }
  }

  /**
   * Generate a presigned URL for direct upload from client
   */
  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    mimeType: string,
    entityId?: string,
    expiresIn: number = 3600
  ): Promise<PresignedUrlResult> {
    // Validate mime type
    if (!ALL_ALLOWED_TYPES.includes(mimeType)) {
      throw new BadRequestError(
        `File type ${mimeType} is not allowed`,
        'INVALID_FILE_TYPE'
      );
    }

    const key = this.generateFileKey(folder, filename, entityId);

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        uploadUrl,
        key,
        expiresIn,
      };
    } catch (error) {
      logger.error('Failed to generate presigned upload URL', { error, key });
      throw new InternalServerError('Failed to generate upload URL', 'URL_GENERATION_FAILED');
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);

      return {
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
      };
    } catch (error) {
      logger.error('Failed to get file metadata', { error, key });
      throw new NotFoundError('File not found', 'FILE_NOT_FOUND');
    }
  }

  /**
   * Copy a file within S3
   */
  async copyFile(sourceKey: string, destinationFolder: string): Promise<string> {
    const filename = path.basename(sourceKey);
    const destinationKey = `${destinationFolder}/${uuidv4()}-${filename}`;

    try {
      const command = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      });

      await s3Client.send(command);
      logger.info('File copied successfully', { sourceKey, destinationKey });

      return destinationKey;
    } catch (error) {
      logger.error('Failed to copy file', { error, sourceKey, destinationKey });
      throw new InternalServerError('Failed to copy file', 'COPY_FAILED');
    }
  }
}

export const uploadService = new UploadService();
