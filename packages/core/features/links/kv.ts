import { env } from 'cloudflare:workers'

function getKv(): KVNamespace | null {
  try {
    return env.LINKS_KV ?? null
  } catch {
    console.error('[links-kv] KV binding LINKS_KV not available')
    return null
  }
}

// ── Key builders ─────────────────────────────────────────────────

export function getLinkCacheKey(shortCode: string): string {
  return `link:${shortCode}`
}

// ── Read helpers ─────────────────────────────────────────────────

export async function getCache(key: string): Promise<string | null> {
  const kv = getKv()
  if (!kv) return null
  try {
    return await kv.get(key)
  } catch (err) {
    console.error('[links-kv] Failed to read key', key, err)
    return null
  }
}

// ── Write helpers ────────────────────────────────────────────────

export async function setCache(key: string, value: string, options?: { ttl?: number }): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.put(key, value, options?.ttl ? { expirationTtl: options.ttl } : undefined)
  } catch (err) {
    console.error('[links-kv] Failed to write key', key, err)
  }
}

// ── Delete helpers ───────────────────────────────────────────────

export async function deleteCache(key: string): Promise<void> {
  const kv = getKv()
  if (!kv) return
  try {
    await kv.delete(key)
  } catch (err) {
    console.error('[links-kv] Failed to delete key', key, err)
  }
}
