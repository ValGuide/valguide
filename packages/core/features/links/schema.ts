import { sql } from 'drizzle-orm'
import { index, jsonb, pgEnum, pgSchema, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

const studioSchema = pgSchema('studio')

export const shortLinkTypeEnum = pgEnum('short_link_type', ['guide', 'stop', 'campaign', 'external', 'landing_page'])

export const short_links = studioSchema.table(
  'short_links',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    type: shortLinkTypeEnum('type').notNull(),
    locale: text('locale'),

    // Type-specific columns (nullable, used based on type)
    guideNanoId: text('guide_nano_id'),
    stopNanoId: text('stop_nano_id'),
    campaignId: text('campaign_id'),
    externalUrl: text('external_url'),
    pageSlug: text('page_slug'),

    // Flexible per-type payload for extras (tracking, UTM, flags, etc.)
    target: jsonb('target').$type<ShortLinkTarget>().notNull().default({}),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Global unique on code
    uniqueIndex('short_links_code_uq').on(table.code),

    // Partial unique indexes per type (one link per target)
    uniqueIndex('short_links_guide_target_uq')
      .on(table.type, table.guideNanoId, table.locale)
      .where(sql`${table.type} = 'guide'`),
    uniqueIndex('short_links_stop_target_uq')
      .on(table.type, table.guideNanoId, table.stopNanoId, table.locale)
      .where(sql`${table.type} = 'stop'`),
    uniqueIndex('short_links_campaign_target_uq')
      .on(table.type, table.campaignId)
      .where(sql`${table.type} = 'campaign'`),
    uniqueIndex('short_links_external_target_uq')
      .on(table.type, table.externalUrl)
      .where(sql`${table.type} = 'external'`),
    uniqueIndex('short_links_landing_target_uq')
      .on(table.type, table.pageSlug, table.locale)
      .where(sql`${table.type} = 'landing_page'`),

    // Index for querying by guide
    index('short_links_guide_idx').on(table.guideNanoId),
  ],
)

// Inferred types
export type ShortLink = typeof short_links.$inferSelect
export type ShortLinkInsert = typeof short_links.$inferInsert
export type ShortLinkType = (typeof shortLinkTypeEnum.enumValues)[number]

// Type-safe target payloads (stored in JSONB)
export type ShortLinkTarget = {
  source?: 'qr' | 'web' | 'print'
  utm?: { campaign?: string; medium?: string; source?: string }
  [key: string]: unknown
}
