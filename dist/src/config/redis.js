"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.connectRedis = exports.getRedisClient = exports.isRedisAvailable = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_js_1 = require("./index.js");
const logger_js_1 = require("../utils/logger.js");
let redis = null;
let redisAvailable = false;
const isRedisAvailable = () => redisAvailable;
exports.isRedisAvailable = isRedisAvailable;
const getRedisClient = () => {
    if (!index_js_1.config.redis.url || index_js_1.config.redis.url === 'redis://localhost:6379') {
        // Skip Redis in development if not configured
        if (!redis) {
            logger_js_1.logger.warn('Redis URL not configured - running without Redis');
        }
        return null;
    }
    if (!redis) {
        redis = new ioredis_1.default(index_js_1.config.redis.url, {
            password: index_js_1.config.redis.password || undefined,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 3) {
                    logger_js_1.logger.error('Redis connection failed after 3 retries');
                    redisAvailable = false;
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
        });
        redis.on('connect', () => {
            redisAvailable = true;
            logger_js_1.logger.info('Redis connected');
        });
        redis.on('error', (error) => {
            redisAvailable = false;
            logger_js_1.logger.error('Redis error:', error.message);
        });
    }
    return redis;
};
exports.getRedisClient = getRedisClient;
const connectRedis = async () => {
    const client = (0, exports.getRedisClient)();
    if (!client)
        return false;
    try {
        await client.connect();
        await client.ping();
        redisAvailable = true;
        return true;
    }
    catch (error) {
        logger_js_1.logger.warn('Redis connection failed - continuing without Redis');
        redisAvailable = false;
        return false;
    }
};
exports.connectRedis = connectRedis;
const closeRedis = async () => {
    if (redis) {
        try {
            await redis.quit();
        }
        catch (e) {
            // Ignore close errors
        }
        redis = null;
    }
};
exports.closeRedis = closeRedis;
exports.default = exports.getRedisClient;
//# sourceMappingURL=redis.js.map