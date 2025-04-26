import { GeneratedColumnConfig } from 'drizzle-orm'
import {
  boolean,
  integer,
  PgColumn,
  pgTable,
  PgTableWithColumns,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

import type { AdapterAccountType } from '@auth/core/adapters'

type DefaultPostgresColumn<
  T extends {
    data: string | number | boolean | Date
    dataType: 'string' | 'number' | 'boolean' | 'date'
    notNull: boolean
    isPrimaryKey?: boolean
    columnType: 'PgVarchar' | 'PgText' | 'PgBoolean' | 'PgTimestamp' | 'PgInteger' | 'PgUUID'
  },
> = PgColumn<{
  name: string
  isAutoincrement: boolean
  isPrimaryKey: T['isPrimaryKey'] extends true ? true : false
  hasRuntimeDefault: boolean
  generated: GeneratedColumnConfig<T['data']> | undefined
  columnType: T['columnType']
  data: T['data']
  driverParam: string | number | boolean
  notNull: T['notNull']
  hasDefault: boolean
  enumValues: any
  dataType: T['dataType']
  tableName: string
}>

export type DefaultPostgresUsersTable = PgTableWithColumns<{
  name: string
  columns: {
    id: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText' | 'PgUUID'
      isPrimaryKey: true
      data: string
      notNull: true
      dataType: 'string'
    }>
    name: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
      dataType: 'string'
    }>
    email: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
      dataType: 'string'
    }>
    username: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
      dataType: 'string'
    }>
    emailVerified: DefaultPostgresColumn<{
      dataType: 'date'
      columnType: 'PgTimestamp'
      data: Date
      notNull: boolean
    }>
    image: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
  }
  dialect: 'pg'
  schema: string | undefined
}>

export type DefaultPostgresAccountsTable = PgTableWithColumns<{
  name: string
  columns: {
    userId: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText' | 'PgUUID'
      data: string
      notNull: true
      dataType: 'string'
    }>
    type: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    provider: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    providerAccountId: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
    }>
    refresh_token: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
    access_token: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
    expires_at: DefaultPostgresColumn<{
      dataType: 'number'
      columnType: 'PgInteger'
      data: number
      notNull: boolean
    }>
    token_type: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
    scope: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
    id_token: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
    session_state: DefaultPostgresColumn<{
      dataType: 'string'
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: boolean
    }>
  }
  dialect: 'pg'
  schema: string | undefined
}>

export type DefaultPostgresSessionsTable = PgTableWithColumns<{
  name: string
  columns: {
    sessionToken: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      isPrimaryKey: true
      notNull: true
      dataType: 'string'
    }>
    userId: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText' | 'PgUUID'
      data: string
      notNull: true
      dataType: 'string'
    }>
    expires: DefaultPostgresColumn<{
      dataType: 'date'
      columnType: 'PgTimestamp'
      data: Date
      notNull: true
    }>
  }
  dialect: 'pg'
  schema: string | undefined
}>

export type DefaultPostgresVerificationTokenTable = PgTableWithColumns<{
  name: string
  columns: {
    identifier: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    token: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    expires: DefaultPostgresColumn<{
      dataType: 'date'
      columnType: 'PgTimestamp'
      data: Date
      notNull: true
    }>
  }
  dialect: 'pg'
  schema: string | undefined
}>

export type DefaultPostgresAuthenticatorTable = PgTableWithColumns<{
  name: string
  columns: {
    credentialID: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    userId: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText' | 'PgUUID'
      data: string
      notNull: true
      dataType: 'string'
    }>
    providerAccountId: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    credentialPublicKey: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    counter: DefaultPostgresColumn<{
      columnType: 'PgInteger'
      data: number
      notNull: true
      dataType: 'number'
    }>
    credentialDeviceType: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: true
      dataType: 'string'
    }>
    credentialBackedUp: DefaultPostgresColumn<{
      columnType: 'PgBoolean'
      data: boolean
      notNull: true
      dataType: 'boolean'
    }>
    transports: DefaultPostgresColumn<{
      columnType: 'PgVarchar' | 'PgText'
      data: string
      notNull: false
      dataType: 'string'
    }>
  }
  dialect: 'pg'
  schema: string | undefined
}>

export type DefaultPostgresSchema = {
  usersTable: DefaultPostgresUsersTable
  accountsTable: DefaultPostgresAccountsTable
  sessionsTable: DefaultPostgresSessionsTable
  verificationTokensTable: DefaultPostgresVerificationTokenTable
  authenticatorsTable: DefaultPostgresAuthenticatorTable
}

export const user = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  username: varchar('username', { length: 256 }).unique(),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
}) satisfies DefaultPostgresUsersTable

export const account = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
) satisfies DefaultPostgresAccountsTable

export const session = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}) satisfies DefaultPostgresSessionsTable

export const verificationToken = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verficationToken) => ({
    compositePk: primaryKey({
      columns: [verficationToken.identifier, verficationToken.token],
    }),
  }),
) satisfies DefaultPostgresVerificationTokenTable

export const authenticator = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
) satisfies DefaultPostgresAuthenticatorTable
