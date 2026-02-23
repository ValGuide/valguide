import { pgSchema, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

const studioSchema = pgSchema('studio')

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
