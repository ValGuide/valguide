import { env } from 'cloudflare:workers'

// Cache TTL in seconds (default: 24 hours)
export const CACHE_TTL = 60 * 60 * 24

export async function setCache(key: string, value: string, options?: { ttl?: number }): Promise<void> {
  await env.LINKS_KV.put(key, value, {
    expirationTtl: options?.ttl ?? CACHE_TTL,
  })
}

export async function getCache(key: string): Promise<string | null> {
  return env.LINKS_KV.get(key)
}

export async function deleteCache(key: string): Promise<void> {
  await env.LINKS_KV.delete(key)
}

export function getLinkCacheKey(shortCode: string): string {
  return `link:${shortCode}`
}
