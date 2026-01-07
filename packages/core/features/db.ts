import {drizzle, type PostgresJsDatabase} from 'drizzle-orm/postgres-js'
import postgres, {type Sql} from 'postgres'
import {serverEnv} from '../env/server'
import * as schema from './schema'

let _client: Sql | null = null
let _db: PostgresJsDatabase<typeof schema> | null = null

export function getClient(): Sql {
    if (_client) return _client
    _client = postgres(serverEnv.DATABASE_URL, {prepare: false})
    return _client
}

export function getDb(): PostgresJsDatabase<typeof schema> {
    if (_db) return _db

    _db = drizzle(getClient(), {
        schema,
        logger: serverEnv.DRIIZLE_LOG_ENABLED,
    })
    return _db
}

export const client = getClient()
export const db = getDb()

export type DB = ReturnType<typeof getDb>
