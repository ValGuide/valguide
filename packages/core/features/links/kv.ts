import { createOptionalKvNamespace } from '../platform/kv-namespace.server'

const linksKv = createOptionalKvNamespace('LINKS_KV', { logPrefix: '[links-kv]' })

// ── Key builders ─────────────────────────────────────────────────

export function getLinkCacheKey(shortCode: string): string {
  return `link:${shortCode}`
}

export async function getCache(key: string): Promise<string | null> {
  return linksKv.readString(key)
}

export async function setCache(key: string, value: string, options?: { ttl?: number }): Promise<void> {
  await linksKv.writeString(key, value, options)
}

export async function deleteCache(key: string): Promise<void> {
  await linksKv.delete(key)
}
