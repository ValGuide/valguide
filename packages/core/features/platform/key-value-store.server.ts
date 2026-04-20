import { getCloudflareKeyValueStore } from './cloudflare-key-value-store.server'
import type { KeyValueStore } from './key-value-store'

export function getOptionalKeyValueStore(bindingName: string, options?: { logPrefix?: string }): KeyValueStore | null {
  return getCloudflareKeyValueStore(bindingName, { logPrefix: options?.logPrefix })
}

export function getRequiredKeyValueStore(bindingName: string, options?: { logPrefix?: string }): KeyValueStore {
  const store = getCloudflareKeyValueStore(bindingName, {
    logPrefix: options?.logPrefix,
    required: true,
  })

  if (!store) {
    throw new Error(`${options?.logPrefix ?? '[kv]'} Required key-value store ${bindingName} is not available`)
  }

  return store
}
