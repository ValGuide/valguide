import { boolean, index, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'

const studioSchema = pgSchema('studio')

export const userStatus = studioSchema.enum('user_status', ['pending', 'approved', 'blocked', 'deactivated'])
export type UserStatus = (typeof userStatus.enumValues)[number]
export const USER_STATUS_CHANGE_SOURCES = ['admin', 'auto_approve', 'self_service'] as const
export type UserStatusChangeSource = (typeof USER_STATUS_CHANGE_SOURCES)[number]

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

export const userStatusEvent = studioSchema.table(
  'user_status_event',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    previousStatus: userStatus('previous_status').notNull(),
    newStatus: userStatus('new_status').notNull(),
    changedByUserId: uuid('changed_by_user_id'),
    source: varchar('source', { length: 32 }).$type<UserStatusChangeSource>().notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('user_status_event_user_idx').on(t.userId),
    createdAtIdx: index('user_status_event_created_at_idx').on(t.createdAt),
  }),
)
