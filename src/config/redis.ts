import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let redis: Redis | null = null;
let redisAvailable = false;

export const isRedisAvailable = (): boolean => redisAvailable;

export const getRedisClient = (): Redis | null => {
  if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
    // Skip Redis in development if not configured
    if (!redis) {
      logger.warn('Redis URL not configured - running without Redis');
    }
    return null;
  }

  if (!redis) {
    redis = new Redis(config.redis.url, {
      password: config.redis.password || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          redisAvailable = false;
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => {
      redisAvailable = true;
      logger.info('Redis connected');
    });

    redis.on('error', (error) => {
      redisAvailable = false;
      logger.error('Redis error:', error.message);
    });
  }

  return redis;
};

export const connectRedis = async (): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.connect();
    await client.ping();
    redisAvailable = true;
    return true;
  } catch (error) {
    logger.warn('Redis connection failed - continuing without Redis');
    redisAvailable = false;
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    try {
      await redis.quit();
    } catch (e) {
      // Ignore close errors
    }
    redis = null;
  }
};

export default getRedisClient;
