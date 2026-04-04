import { boolean, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'

const studioSchema = pgSchema('studio')

export const userStatus = studioSchema.enum('user_status', ['pending', 'approved', 'blocked', 'deactivated'])

export const profiles = studioSchema.table('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id),
  is_onboarded: boolean('is_onboarded').default(false).notNull(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatarStoragePath: text('avatar_storage_path'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
  status: userStatus('status').default('pending').notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  blockedAt: timestamp('blocked_at', { withTimezone: true }),
  blockedReason: text('blocked_reason'),
})
