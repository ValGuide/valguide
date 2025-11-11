// Mock postgres module for Storybook  
const mockPostgres: any = function postgres(connectionString?: string, options?: any) {
  const mockClient: any = () => Promise.resolve({ rows: [] })
  
  // postgres.js client structure expected by Drizzle ORM
  mockClient.options = options || { prepare: false }
  mockClient.parameters = {}
  
  // Create a Proxy for types to allow dynamic property assignment
  mockClient.types = new Proxy(
    {
      arrayParser: () => ({}),
      builtins: {},
    },
    {
      get: (target: any, prop) => {
        if (prop in target) return target[prop]
        // Return a mock parser function for any type OID
        return { to: 0, from: [] }
      },
      set: (target: any, prop, value) => {
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
