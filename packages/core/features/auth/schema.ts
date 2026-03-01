import { boolean, index, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

const studioSchema = pgSchema('studio')
const authSchema = pgSchema('auth')

// =============================================================================
// BETTER AUTH TABLES
// =============================================================================

export const authUsers = authSchema.table(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueEmail: uniqueIndex('auth_user_email_unique').on(t.email),
  }),
)

export const authSessions = authSchema.table(
  'session',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueToken: uniqueIndex('auth_session_token_unique').on(t.token),
    userIdIdx: index('auth_session_user_id_idx').on(t.userId),
  }),
)

export const authAccounts = authSchema.table(
  'account',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    providerAccountUnique: uniqueIndex('auth_account_provider_account_unique').on(t.providerId, t.accountId),
    userIdIdx: index('auth_account_user_id_idx').on(t.userId),
  }),
)

export const authVerifications = authSchema.table(
  'verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    identifierValueUnique: uniqueIndex('auth_verification_identifier_value_unique').on(t.identifier, t.value),
  }),
)

// =============================================================================
// APPROVED DOMAINS (Global whitelist for auto-approval bypass)
// =============================================================================

export const approvedDomain = studioSchema.table(
  'approved_domain',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    domain: varchar('domain', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqueDomain: uniqueIndex('approved_domain_unique').on(t.domain),
  }),
)

export type ApprovedDomain = typeof approvedDomain.$inferSelect
export type AuthUser = typeof authUsers.$inferSelect
