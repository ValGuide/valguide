import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const short_links = pgTable('short_links', {
  id: serial('id').primaryKey(),
  shortCode: text('code').notNull().unique('unique_link_short_code'),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})
