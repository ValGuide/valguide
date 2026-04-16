import { createSecondaryStorage, getSecondaryStorageKey, getSecondaryStorageTtl } from './secondary-storage'

describe('secondary storage', () => {
  it('prefixes keys with the auth scope', async () => {
    const get = jest.fn().mockResolvedValue('stored-value')
    const kv = {
      get,
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as KVNamespace

    const storage = createSecondaryStorage({
      kv,
      scope: 'valguide-auth',
    })

    const result = await storage.get('session:token')

    expect(result).toBe('stored-value')
    expect(get).toHaveBeenCalledWith('better-auth:valguide-auth:session:token')
  })

  it('passes TTL through to Cloudflare KV expirationTtl', async () => {
    const put = jest.fn().mockResolvedValue(undefined)
    const kv = {
      get: jest.fn(),
      put,
      delete: jest.fn(),
    } as unknown as KVNamespace

    const storage = createSecondaryStorage({
      kv,
      scope: 'valguide-auth',
    })

    await storage.set('verification:otp', 'payload', 299.2)

    expect(put).toHaveBeenCalledWith('better-auth:valguide-auth:verification:otp', 'payload', {
      expirationTtl: 300,
    })
  })

  it('omits expiration when Better Auth does not provide a usable TTL', async () => {
    const put = jest.fn().mockResolvedValue(undefined)
    const kv = {
      get: jest.fn(),
      put,
      delete: jest.fn(),
    } as unknown as KVNamespace

    const storage = createSecondaryStorage({
      kv,
      scope: 'valguide-auth',
    })

    await storage.set('session:token', 'payload')
    await storage.set('session:token', 'payload', 0)

    expect(put).toHaveBeenNthCalledWith(1, 'better-auth:valguide-auth:session:token', 'payload', undefined)
    expect(put).toHaveBeenNthCalledWith(2, 'better-auth:valguide-auth:session:token', 'payload', undefined)
  })

  it('exposes helpers for deterministic key and TTL normalization', () => {
    expect(getSecondaryStorageKey('scope', 'key')).toBe('better-auth:scope:key')
    expect(getSecondaryStorageTtl(60.1)).toBe(61)
    expect(getSecondaryStorageTtl(0)).toBeUndefined()
    expect(getSecondaryStorageTtl(Number.NaN)).toBeUndefined()
  })
})
