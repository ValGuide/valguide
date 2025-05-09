import { boolean, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'

export const organization = pgTable('organization', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique('unique_org_slug'),
  logo: text('logo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const organizationMember = pgTable('organization_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  isOwner: boolean('is_owner').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

// Add a unique constraint to ensure a user can only have one role per organization
export const organizationMemberUnique = uniqueIndex('organization_member_unique').on(
  organizationMember.organizationId,
  organizationMember.userId,
)
