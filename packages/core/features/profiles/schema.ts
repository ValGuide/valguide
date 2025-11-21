import { boolean, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'

const studioSchema = pgSchema('studio')

export const profiles = studioSchema.table('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id),
  is_onboarded: boolean('is_onboarded').default(false).notNull(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  onboardedAt: timestamp('onboarded_at', { withTimezone: true }),
})
