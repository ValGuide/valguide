import { env } from 'cloudflare:workers'
import type { KeyValueStore, KeyValueStoreOptions } from '../../kv/key-value-store'

function normalizeTtl(ttl?: number): number | undefined {
  if (typeof ttl !== 'number' || !Number.isFinite(ttl)) {
    return undefined
  }

  const normalized = Math.ceil(ttl)
  return normalized > 0 ? normalized : undefined
}

function toKvPutOptions(options?: KeyValueStoreOptions): KVNamespacePutOptions | undefined {
  const expirationTtl = normalizeTtl(options?.ttl)
  return expirationTtl ? { expirationTtl } : undefined
}

export function createCloudflareKeyValueStore(kv: KVNamespace): KeyValueStore {
  return {
    async get(key: string): Promise<string | null> {
      return kv.get(key)
    },

    async getJson<T>(key: string): Promise<T | null> {
      const value = await kv.get(key, { type: 'json' })
      return (value as T | null) ?? null
    },

    async set(key: string, value: string, options?: KeyValueStoreOptions): Promise<void> {
      await kv.put(key, value, toKvPutOptions(options))
    },

    async setJson(key: string, value: unknown, options?: KeyValueStoreOptions): Promise<void> {
      await kv.put(key, JSON.stringify(value), toKvPutOptions(options))
    },

    async delete(key: string): Promise<void> {
      await kv.delete(key)
    },
  }
}

export function getCloudflareKeyValueStore(
  bindingName: string,
  options?: { logPrefix?: string; required?: boolean },
): KeyValueStore | null {
  const logPrefix = options?.logPrefix ?? '[kv]'

  try {
    const bindings = env as unknown as Record<string, KVNamespace | undefined>
    const kv = bindings[bindingName]

    if (!kv) {
      if (options?.required) {
        throw new Error(`${logPrefix} KV binding ${bindingName} is not available`)
      }

      console.error(`${logPrefix} KV binding ${bindingName} not available`)
      return null
    }

    return createCloudflareKeyValueStore(kv)
  } catch (error) {
    if (options?.required) {
      throw error
    }

    console.error(`${logPrefix} Failed to resolve KV binding ${bindingName}`, error)
    return null
  }
}
