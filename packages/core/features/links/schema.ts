import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'
import { organization } from '../orgs/schema'
import { stop, tour } from '../tours/schema'
import type { QrBrandingOverride } from './qr/shared'

const studioSchema = pgSchema('studio')

export const shortLinkTypeEnum = studioSchema.enum('short_link_type', [
  'tour',
  'stop',
  'campaign',
  'external',
  'landing_page',
])

export const short_links = studioSchema.table(
  'short_links',
  {
    id: serial('id').primaryKey(),
    organizationId: uuid('organization_id').references(() => organization.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    type: shortLinkTypeEnum('type').notNull(),
    title: text('title'),
    description: text('description'),
    context: text('context'),
    status: text('status').$type<ShortLinkStatus>().notNull().default('active'),
    locale: text('locale'),

    // Type-specific columns (nullable, used based on type)
    tourNanoId: text('tour_nano_id'),
    stopNanoId: text('stop_nano_id'),
    campaignId: text('campaign_id'),
    externalUrl: text('external_url'),
    pageSlug: text('page_slug'),

    // Flexible per-type payload for extras (tracking, UTM, flags, etc.)
    target: jsonb('target').$type<ShortLinkTarget>().notNull().default({}),
    openCount: integer('open_count').notNull().default(0),
    lastOpenedAt: timestamp('last_opened_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (table) => [
    // Global unique on code
    uniqueIndex('short_links_code_uq').on(table.code),

    // Partial unique indexes per type (one link per target)
    uniqueIndex('short_links_tour_target_uq')
      .on(table.organizationId, table.type, table.tourNanoId)
      .where(sql`${table.type} = 'tour'`),
    uniqueIndex('short_links_stop_target_uq')
      .on(table.organizationId, table.type, table.tourNanoId, table.stopNanoId)
      .where(sql`${table.type} = 'stop'`),
    uniqueIndex('short_links_campaign_target_uq')
      .on(table.organizationId, table.type, table.campaignId)
      .where(sql`${table.type} = 'campaign'`),
    uniqueIndex('short_links_landing_target_uq')
      .on(table.organizationId, table.type, table.pageSlug, table.locale)
      .where(sql`${table.type} = 'landing_page'`),

    // Index for querying by tour
    index('short_links_org_idx').on(table.organizationId),
    index('short_links_org_status_idx').on(table.organizationId, table.status),
    index('short_links_tour_idx').on(table.tourNanoId),
  ],
)

export const short_link_daily_stats = studioSchema.table(
  'short_link_daily_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shortLinkId: integer('short_link_id')
      .notNull()
      .references(() => short_links.id, { onDelete: 'cascade' }),
    day: varchar('day', { length: 10 }).notNull(),
    openCount: integer('open_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('short_link_daily_stats_short_link_day_uq').on(table.shortLinkId, table.day),
    index('short_link_daily_stats_short_link_idx').on(table.shortLinkId),
    index('short_link_daily_stats_day_idx').on(table.day),
  ],
)

export const organization_qr_branding = studioSchema.table(
  'organization_qr_branding',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    overrides: jsonb('overrides').$type<QrBrandingOverride>().notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (table) => [uniqueIndex('organization_qr_branding_org_uq').on(table.organizationId)],
)

export const tour_qr_branding = studioSchema.table(
  'tour_qr_branding',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    overrides: jsonb('overrides').$type<QrBrandingOverride>().notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (table) => [uniqueIndex('tour_qr_branding_tour_uq').on(table.tourId)],
)

export const stop_qr_branding = studioSchema.table(
  'stop_qr_branding',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    overrides: jsonb('overrides').$type<QrBrandingOverride>().notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (table) => [uniqueIndex('stop_qr_branding_stop_uq').on(table.stopId)],
)

// Inferred types
export type ShortLink = typeof short_links.$inferSelect
export type ShortLinkInsert = typeof short_links.$inferInsert
export type ShortLinkType = (typeof shortLinkTypeEnum.enumValues)[number]
export type ShortLinkStatus = 'active' | 'archived'
export type ShortLinkDailyStat = typeof short_link_daily_stats.$inferSelect
export type OrganizationQrBranding = typeof organization_qr_branding.$inferSelect
export type TourQrBranding = typeof tour_qr_branding.$inferSelect
export type StopQrBranding = typeof stop_qr_branding.$inferSelect

// Type-safe target payloads (stored in JSONB)
export type ShortLinkTarget = {
  source?: 'qr' | 'web' | 'print'
  utm?: { campaign?: string; medium?: string; source?: string }
  [key: string]: unknown
}
