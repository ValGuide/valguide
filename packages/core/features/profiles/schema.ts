import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id), // link to auth.users
  is_onboarded: boolean('is_onboarded').default(false).notNull(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
})

export const authUsers = pgTable('auth.users', {
  id: uuid('id').primaryKey(),
})
