import Redis from 'ioredis';
export declare const isRedisAvailable: () => boolean;
export declare const getRedisClient: () => Redis | null;
export declare const connectRedis: () => Promise<boolean>;
export declare const closeRedis: () => Promise<void>;
export default getRedisClient;
//# sourceMappingURL=redis.d.ts.map