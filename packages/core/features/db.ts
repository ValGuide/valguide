import { AsyncLocalStorage } from 'node:async_hooks'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'
import { serverEnv } from '../env/server'
import * as schema from './schema'

// ============================================================================
// Per-request DB context via AsyncLocalStorage
// ============================================================================

type RequestDbStore = {
  sql: Sql | null
  db: PostgresJsDatabase<typeof schema> | null
}

const requestDbStore = new AsyncLocalStorage<RequestDbStore>()

function getOrCreateRequestDb(store: RequestDbStore): PostgresJsDatabase<typeof schema> {
  if (!store.db) {
    store.sql = getClient()
    store.db = drizzle(store.sql, { schema, logger: serverEnv.DRIZZLE_LOG_ENABLED })
  }
  return store.db
}

// ============================================================================
// Connection factory
// ============================================================================

/**
 * Creates a fresh postgres.js client.
 * Each call returns a new client — required for Cloudflare Workers
 * where I/O objects are bound to the request context that created them.
 */
export function getClient(): Sql {
  return postgres(serverEnv.DATABASE_URL, { prepare: false, max: 1 })
}

/**
 * Creates a fresh Drizzle ORM instance with its own postgres client.
 * Uses Neon connection pooler, so per-call clients are cheap.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  return drizzle(getClient(), {
    schema,
    logger: serverEnv.DRIZZLE_LOG_ENABLED,
  })
}

// ============================================================================
// Request-scoped runner
// ============================================================================

/**
 * Runs `fn` within a request-scoped DB context.
 * All `db` property accesses inside `fn` share one postgres.js connection.
 * Connection is closed in `finally` after `fn` completes.
 */
export async function runWithRequestDb<T>(fn: () => Promise<T>): Promise<T> {
  const store: RequestDbStore = { sql: null, db: null }
  return requestDbStore.run(store, async () => {
    try {
      return await fn()
    } finally {
      if (store.sql) {
        store.sql.end({ timeout: 0 }).catch(console.error)
      }
    }
  })
}

// ============================================================================
// Proxy-backed DB instance
// ============================================================================

/**
 * Request-scoped DB instance via AsyncLocalStorage.
 *
 * When inside `runWithRequestDb()` (i.e., within a TanStack Start request):
 * returns a request-scoped Drizzle instance — one postgres.js connection
 * shared across middleware, auth checks, and handler.
 *
 * When outside (scripts, seeds, Hono API): falls back to creating a fresh
 * instance per property access (per-query connection).
 */
export const db: PostgresJsDatabase<typeof schema> = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const store = requestDbStore.getStore()
    const instance = store ? getOrCreateRequestDb(store) : getDb()
    const value = Reflect.get(instance as object, prop)
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})

export type DB = PostgresJsDatabase<typeof schema>
