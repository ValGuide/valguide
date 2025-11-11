import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.VG_DATABASE_URL || ''
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = connectionString ? postgres(connectionString, { prepare: false }) : ({} as any)
export const db = connectionString ? drizzle(client, {
  schema,
  logger: process.env.VG_DRIIZLE_LOG_ENABLED === 'true',
}) : ({} as any)

export type DB = typeof db
