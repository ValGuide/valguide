import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const link = pgTable('link', {
  id: serial('id').primaryKey(),
  shortCode: varchar('short_code', { length: 10 }).notNull().unique('unique_link_short_code'),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
  expiresAt: timestamp('expires_at'),
  clicks: serial('clicks').default(0),
})
