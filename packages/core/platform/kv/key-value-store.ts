export type KeyValueStoreOptions = {
  ttl?: number
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>
  getJson<T>(key: string): Promise<T | null>
  set(key: string, value: string, options?: KeyValueStoreOptions): Promise<void>
  setJson(key: string, value: unknown, options?: KeyValueStoreOptions): Promise<void>
  delete(key: string): Promise<void>
}
