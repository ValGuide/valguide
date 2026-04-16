import type { SecondaryStorage } from 'better-auth/db'

const authKvKeyPrefix = 'better-auth'

type Logger = {
  error: (...args: unknown[]) => void
}

function normalizeTtl(ttl?: number): number | undefined {
  if (typeof ttl !== 'number' || !Number.isFinite(ttl)) {
    return undefined
  }

  const normalized = Math.ceil(ttl)
  return normalized > 0 ? normalized : undefined
}

function buildStorageKey(scope: string, key: string): string {
  return `${authKvKeyPrefix}:${scope}:${key}`
}

export function createSecondaryStorage(options: { kv: KVNamespace; scope: string; logger?: Logger }): SecondaryStorage {
  const logger = options.logger ?? console

  return {
    async get(key) {
      try {
        return await options.kv.get(buildStorageKey(options.scope, key))
      } catch (error) {
        logger.error('[auth-kv] Failed to read secondary storage key', key, error)
        return null
      }
    },
    async set(key, value, ttl) {
      try {
        const expirationTtl = normalizeTtl(ttl)
        await options.kv.put(buildStorageKey(options.scope, key), value, expirationTtl ? { expirationTtl } : undefined)
      } catch (error) {
        logger.error('[auth-kv] Failed to write secondary storage key', key, error)
      }
    },
    async delete(key) {
      try {
        await options.kv.delete(buildStorageKey(options.scope, key))
      } catch (error) {
        logger.error('[auth-kv] Failed to delete secondary storage key', key, error)
      }
    },
  }
}

export function getSecondaryStorageKey(scope: string, key: string): string {
  return buildStorageKey(scope, key)
}

export function getSecondaryStorageTtl(ttl?: number): number | undefined {
  return normalizeTtl(ttl)
}
