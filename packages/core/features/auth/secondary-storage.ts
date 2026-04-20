import type { SecondaryStorage } from 'better-auth/db'
import type { KeyValueStore } from '../platform/key-value-store'

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

export function createSecondaryStorage(options: {
  store: KeyValueStore
  scope: string
  logger?: Logger
}): SecondaryStorage {
  const logger = options.logger ?? console

  return {
    async get(key) {
      try {
        return await options.store.get(buildStorageKey(options.scope, key))
      } catch (error) {
        logger.error('[auth-kv] Failed to read secondary storage key', key, error)
        return null
      }
    },
    async set(key, value, ttl) {
      try {
        await options.store.set(buildStorageKey(options.scope, key), value, { ttl: normalizeTtl(ttl) })
      } catch (error) {
        logger.error('[auth-kv] Failed to write secondary storage key', key, error)
      }
    },
    async delete(key) {
      try {
        await options.store.delete(buildStorageKey(options.scope, key))
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
