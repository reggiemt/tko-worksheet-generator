import { Redis } from "@upstash/redis";

function getRedisConfig(): { url: string; token: string } | null {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    return { url: restUrl, token: restToken };
  }
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      if (parsed.hostname && parsed.password) {
        return { url: `https://${parsed.hostname}`, token: parsed.password };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

let _redis: Redis | null | undefined = undefined;

/**
 * Get a shared Redis client instance.
 * Returns null if Redis is not configured.
 */
export function getRedisClient(): Redis | null {
  if (_redis !== undefined) return _redis;
  const config = getRedisConfig();
  if (config) {
    try {
      _redis = new Redis(config);
    } catch {
      _redis = null;
    }
  } else {
    _redis = null;
  }
  return _redis;
}
