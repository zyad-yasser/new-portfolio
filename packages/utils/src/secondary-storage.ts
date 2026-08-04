import { getRedis } from "./redis";

export function createSecondaryStorage(prefix: string) {
  const redis = getRedis();
  const key = (k: string) => `secondary:${prefix}:${k}`;

  return {
    get: (k: string) => redis.get<string>(key(k)),
    set: (k: string, value: string, ttl?: number) =>
      ttl ? redis.set(key(k), value, { ex: ttl }) : redis.set(key(k), value),
    delete: async (k: string) => {
      await redis.del(key(k));
    },
    increment: async (k: string, ttl: number) => {
      const fullKey = key(k);
      const count = await redis.incr(fullKey);
      if (count === 1) {
        await redis.expire(fullKey, ttl);
      }
      return count;
    },
  };
}
