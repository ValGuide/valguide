import { Redis } from '@upstash/redis'
import { serverEnv } from '../../env/server'

// Create Redis client using environment variables
export const redis = new Redis({
  url: serverEnv.KV_REST_API_URL,
  token: serverEnv.KV_REST_API_TOKEN,
})

// Cache TTL in seconds (default: 24 hours)
export const CACHE_TTL = 60 * 60 * 24

/**
 * Set a value in Redis cache with expiration
 */
export async function setCache<T>(
  key: string,
  value: T,
  options?: {
    ttl?: number
  },
): Promise<void> {
  await redis.set(key, value, options?.ttl ? { ex: options.ttl } : undefined)
}

/**
 * Get a value from Redis cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

/**
 * Delete a value from Redis cache
 */
export async function deleteCache(key: string): Promise<void> {
  await redis.del(key)
}

/**
 * Generate a cache key for a short link
 */
export function getLinkCacheKey(shortCode: string): string {
  return `link:${shortCode}`
}
