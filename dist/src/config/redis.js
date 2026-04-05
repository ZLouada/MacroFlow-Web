"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_js_1 = require("./index.js");
const logger_js_1 = require("../utils/logger.js");
let redis = null;
const getRedisClient = () => {
    if (!redis) {
        redis = new ioredis_1.default(index_js_1.config.redis.url, {
            password: index_js_1.config.redis.password || undefined,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    logger_js_1.logger.error('Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
        });
        redis.on('connect', () => {
            logger_js_1.logger.info('Redis connected');
        });
        redis.on('error', (error) => {
            logger_js_1.logger.error('Redis error:', error);
        });
    }
    return redis;
};
exports.getRedisClient = getRedisClient;
const closeRedis = async () => {
    if (redis) {
        await redis.quit();
        redis = null;
    }
};
exports.closeRedis = closeRedis;
exports.default = exports.getRedisClient;
//# sourceMappingURL=redis.js.map