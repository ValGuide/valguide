import type { KeyValueStoreOptions } from './key-value-store'
import { getOptionalKeyValueStore } from './key-value-store.server'

export type KvNamespace = {
  readString(key: string): Promise<string | null>
  readJson<T>(key: string): Promise<T | null>
  writeString(key: string, value: string, options?: KeyValueStoreOptions): Promise<void>
  writeJson(key: string, value: unknown, options?: KeyValueStoreOptions): Promise<void>
  delete(key: string): Promise<void>
  deleteMany(keys: string[]): Promise<void>
}

export function createOptionalKvNamespace(bindingName: string, options?: { logPrefix?: string }): KvNamespace {
  const logPrefix = options?.logPrefix ?? '[kv]'

  function getStore() {
    return getOptionalKeyValueStore(bindingName, { logPrefix })
  }

  return {
    async readString(key: string): Promise<string | null> {
      const store = getStore()
      if (!store) return null

      try {
        return await store.get(key)
      } catch (error) {
        console.error(`${logPrefix} Failed to read key`, key, error)
        return null
      }
    },

    async readJson<T>(key: string): Promise<T | null> {
      const store = getStore()
      if (!store) return null

      try {
        return await store.getJson<T>(key)
      } catch (error) {
        console.error(`${logPrefix} Failed to read JSON key`, key, error)
        return null
      }
    },

    async writeString(key: string, value: string, options?: KeyValueStoreOptions): Promise<void> {
      const store = getStore()
      if (!store) return

      try {
        await store.set(key, value, options)
      } catch (error) {
        console.error(`${logPrefix} Failed to write key`, key, error)
      }
    },

    async writeJson(key: string, value: unknown, options?: KeyValueStoreOptions): Promise<void> {
      const store = getStore()
      if (!store) return

      try {
        await store.setJson(key, value, options)
      } catch (error) {
        console.error(`${logPrefix} Failed to write JSON key`, key, error)
      }
    },

    async delete(key: string): Promise<void> {
      const store = getStore()
      if (!store) return

      try {
        await store.delete(key)
      } catch (error) {
        console.error(`${logPrefix} Failed to delete key`, key, error)
      }
    },

    async deleteMany(keys: string[]): Promise<void> {
      const store = getStore()
      if (!store) return

      try {
        await Promise.all(keys.map((key) => store.delete(key)))
      } catch (error) {
        console.error(`${logPrefix} Failed to delete keys`, keys, error)
      }
    },
  }
}
