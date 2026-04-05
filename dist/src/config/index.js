"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000').transform(Number),
    API_VERSION: zod_1.z.string().default('v1'),
    // Database
    DATABASE_URL: zod_1.z.string(),
    // Redis
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    // Google OAuth
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().default('/api/v1/auth/google/callback'),
    // S3
    S3_BUCKET: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().default('us-east-1'),
    S3_ACCESS_KEY: zod_1.z.string().optional(),
    S3_SECRET_KEY: zod_1.z.string().optional(),
    S3_ENDPOINT: zod_1.z.string().optional(),
    // SMTP
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().default('587').transform(Number),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('noreply@macroflow.com'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('60000').transform(Number),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100').transform(Number),
    RATE_LIMIT_AUTH_MAX: zod_1.z.string().default('10').transform(Number),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:3001'),
    CORS_CREDENTIALS: zod_1.z.string().default('true').transform((v) => v === 'true'),
    // Frontend
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3001'),
    // Logging
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.config = {
    server: {
        port: exports.env.PORT,
        nodeEnv: exports.env.NODE_ENV,
        apiVersion: exports.env.API_VERSION,
        isDevelopment: exports.env.NODE_ENV === 'development',
        isProduction: exports.env.NODE_ENV === 'production',
        isTest: exports.env.NODE_ENV === 'test',
    },
    database: {
        url: exports.env.DATABASE_URL,
    },
    redis: {
        url: exports.env.REDIS_URL,
        password: exports.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: exports.env.JWT_SECRET,
        refreshSecret: exports.env.JWT_REFRESH_SECRET,
        expiresIn: exports.env.JWT_EXPIRES_IN,
        refreshExpiresIn: exports.env.JWT_REFRESH_EXPIRES_IN,
    },
    google: {
        clientId: exports.env.GOOGLE_CLIENT_ID,
        clientSecret: exports.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: exports.env.GOOGLE_CALLBACK_URL,
    },
    s3: {
        bucket: exports.env.S3_BUCKET,
        region: exports.env.S3_REGION,
        accessKey: exports.env.S3_ACCESS_KEY,
        secretKey: exports.env.S3_SECRET_KEY,
        endpoint: exports.env.S3_ENDPOINT,
    },
    smtp: {
        host: exports.env.SMTP_HOST,
        port: exports.env.SMTP_PORT,
        user: exports.env.SMTP_USER,
        pass: exports.env.SMTP_PASS,
        from: exports.env.EMAIL_FROM,
    },
    rateLimit: {
        windowMs: exports.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: exports.env.RATE_LIMIT_MAX_REQUESTS,
        authMaxRequests: exports.env.RATE_LIMIT_AUTH_MAX,
    },
    cors: {
        origin: exports.env.CORS_ORIGIN,
        credentials: exports.env.CORS_CREDENTIALS,
    },
    frontend: {
        url: exports.env.FRONTEND_URL,
    },
    logging: {
        level: exports.env.LOG_LEVEL,
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map