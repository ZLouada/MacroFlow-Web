import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      password: config.redis.password || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', (error) => {
      logger.error('Redis error:', error);
    });
  }

  return redis;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

export default getRedisClient;
