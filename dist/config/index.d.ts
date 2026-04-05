export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    API_VERSION: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    S3_REGION: string;
    SMTP_PORT: number;
    EMAIL_FROM: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    RATE_LIMIT_AUTH_MAX: number;
    CORS_ORIGIN: string;
    CORS_CREDENTIALS: boolean;
    FRONTEND_URL: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    REDIS_PASSWORD?: string | undefined;
    S3_BUCKET?: string | undefined;
    S3_ACCESS_KEY?: string | undefined;
    S3_SECRET_KEY?: string | undefined;
    S3_ENDPOINT?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
};
export declare const config: {
    server: {
        port: number;
        nodeEnv: "development" | "production" | "test";
        apiVersion: string;
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
    };
    database: {
        url: string;
    };
    redis: {
        url: string;
        password: string | undefined;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    s3: {
        bucket: string | undefined;
        region: string;
        accessKey: string | undefined;
        secretKey: string | undefined;
        endpoint: string | undefined;
    };
    smtp: {
        host: string | undefined;
        port: number;
        user: string | undefined;
        pass: string | undefined;
        from: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        authMaxRequests: number;
    };
    cors: {
        origin: string;
        credentials: boolean;
    };
    frontend: {
        url: string;
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map