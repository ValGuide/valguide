import { env } from 'cloudflare:workers'

export async function setCache(key: string, value: string, options?: { ttl?: number }): Promise<void> {
  await env.LINKS_KV.put(key, value, options?.ttl ? { expirationTtl: options.ttl } : undefined)
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
