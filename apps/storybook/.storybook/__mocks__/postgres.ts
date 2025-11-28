// biome-ignore-all lint/suspicious/noExplicitAny: Mock file for Storybook
const mockPostgres = function postgres(_connectionString?: string, options?: Record<string, unknown>) {
  const mockClient = (() => Promise.resolve({ rows: [] })) as unknown as Record<string, unknown>

  mockClient.options = options || { prepare: false }
  mockClient.parameters = {}

  mockClient.types = new Proxy(
    {
      arrayParser: () => ({}),
      builtins: {},
    } as Record<string, unknown>,
    {
      get: (target: Record<string, unknown>, prop) => {
        if (prop in target) return target[prop]
        return { to: 0, from: [] }
      },
      set: (target: Record<string, unknown>, prop: string, value) => {
        target[prop] = value
        return true
      },
    },
  )

  // Mock query method
  mockClient.query = () => Promise.resolve({ rows: [] })
  mockClient.end = () => Promise.resolve()

  return mockClient
}

// Attach parsers to the postgres function itself
mockPostgres.parsers = {}
mockPostgres.types = {}

export default mockPostgres
