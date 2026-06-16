import { createSecondaryStorage } from './secondary-storage'

describe('secondary storage', () => {
  it('prefixes keys with the auth scope', async () => {
    const get = jest.fn().mockResolvedValue('stored-value')
    const store = {
      get,
      getJson: jest.fn(),
      set: jest.fn(),
      setJson: jest.fn(),
      delete: jest.fn(),
    }

    const storage = createSecondaryStorage({
      store,
      scope: 'valguide-auth',
    })

    const result = await storage.get('session:token')

    expect(result).toBe('stored-value')
    expect(get).toHaveBeenCalledWith('better-auth:valguide-auth:session:token')
  })

  it('passes TTL through to Cloudflare KV expirationTtl', async () => {
    const set = jest.fn().mockResolvedValue(undefined)
    const store = {
      get: jest.fn(),
      getJson: jest.fn(),
      set,
      setJson: jest.fn(),
      delete: jest.fn(),
    }

    const storage = createSecondaryStorage({
      store,
      scope: 'valguide-auth',
    })

    await storage.set('verification:otp', 'payload', 299.2)

    expect(set).toHaveBeenCalledWith('better-auth:valguide-auth:verification:otp', 'payload', {
      ttl: 300,
    })
  })

  it('omits expiration when Better Auth does not provide a usable TTL', async () => {
    const set = jest.fn().mockResolvedValue(undefined)
    const store = {
      get: jest.fn(),
      getJson: jest.fn(),
      set,
      setJson: jest.fn(),
      delete: jest.fn(),
    }

    const storage = createSecondaryStorage({
      store,
      scope: 'valguide-auth',
    })

    await storage.set('session:token', 'payload')
    await storage.set('session:token', 'payload', 0)

    expect(set).toHaveBeenNthCalledWith(1, 'better-auth:valguide-auth:session:token', 'payload', { ttl: undefined })
    expect(set).toHaveBeenNthCalledWith(2, 'better-auth:valguide-auth:session:token', 'payload', { ttl: undefined })
  })
})
