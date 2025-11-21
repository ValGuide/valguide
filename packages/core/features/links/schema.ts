import { pgSchema, serial, text, timestamp } from 'drizzle-orm/pg-core'

const studioSchema = pgSchema('studio')

export const short_links = studioSchema.table('short_links', {
  id: serial('id').primaryKey(),
  shortCode: text('code').notNull().unique('unique_link_short_code'),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})
