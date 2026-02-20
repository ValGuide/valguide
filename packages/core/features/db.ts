import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'
import { serverEnv } from '../env/server'
import * as schema from './schema'

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
 * Uses Supabase Supavisor connection pooler, so per-call clients are cheap.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  return drizzle(getClient(), {
    schema,
    logger: serverEnv.DRIZZLE_LOG_ENABLED,
  })
}

/**
 * Proxy-backed DB instance for backward-compatible `import { db }` usage.
 *
 * Creates a fresh Drizzle instance on each property access, ensuring each
 * query chain gets its own postgres connection. Required for Cloudflare
 * Workers where I/O objects from one request can't be used in another
 * request's context ("Cannot perform I/O on behalf of a different request").
 *
 * On Vercel/Node.js this creates short-lived per-query connections,
 * which is fine with Supavisor connection pooler (prepare: false).
 */
export const db: PostgresJsDatabase<typeof schema> = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb()
    const value = (instance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})

export type DB = PostgresJsDatabase<typeof schema>
