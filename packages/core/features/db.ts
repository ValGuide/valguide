import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'
import * as schema from './schema'

const connectionString = process.env.VG_DATABASE_URL || ''
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client: Sql = connectionString ? postgres(connectionString, { prepare: false }) : ({} as unknown as Sql)
export const db: PostgresJsDatabase<typeof schema> = connectionString
  ? drizzle(client, {
      schema,
      logger: process.env.VG_DRIIZLE_LOG_ENABLED === 'true',
    })
  : ({} as unknown as PostgresJsDatabase<typeof schema>)

export type DB = typeof db
