import { relations, sql } from 'drizzle-orm'
import { boolean, index, integer, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { organization } from '../orgs/schema'

/**
 * ValGuide – Simplified Schema v3.0 (February 2026)
 *
 * Architecture:
 * - Staging only (draft → live) for ALL aspects: locale, settings, structure, assets
 * - No versioning for MVP (can be added later as append-only table)
 * - Publish = upsert from draft to live
 * - 17 tables total (removed 2 version tables)
 *
 * See: docs/tour-stop-asset/target-schema.md
 */

const studioSchema = pgSchema('studio')

// =============================================================================
// BASE ENTITIES
// =============================================================================

export const tour = studioSchema.table(
  'tour',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_tour_nano_id'),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    archivedAt: timestamp('archived_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    availableLocales: text('available_locales').array().notNull().default(['en']),
  },
  (t) => ({
    tourOrgIdx: index('tour_org_idx').on(t.organizationId),
  }),
)

export const stop = studioSchema.table(
  'stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_stop_nano_id'),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    availableLocales: text('available_locales').array().notNull().default(['en']),
  },
  (t) => ({
    stopOrgIdx: index('stop_org_idx').on(t.organizationId),
  }),
)

// =============================================================================
// LOCALE TEXT (Staging Only - Draft → Live)
// Pattern: draft + live pair, publish = UPSERT from draft
// =============================================================================

export const tourLocaleDraft = studioSchema.table(
  'tour_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqTourLocaleDraft: uniqueIndex('uniq_tour_locale_draft').on(t.tourId, t.locale),
    tourIdx: index('tour_locale_draft_tour_idx').on(t.tourId),
  }),
)

export const tourLocale = studioSchema.table(
  'tour_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqTourLocale: uniqueIndex('uniq_tour_locale').on(t.tourId, t.locale),
    tourIdx: index('tour_locale_tour_idx').on(t.tourId),
  }),
)

export const stopLocaleDraft = studioSchema.table(
  'stop_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopLocaleDraft: uniqueIndex('uniq_stop_locale_draft').on(t.stopId, t.locale),
    stopIdx: index('stop_locale_draft_stop_idx').on(t.stopId),
  }),
)

export const stopLocale = studioSchema.table(
  'stop_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopLocale: uniqueIndex('uniq_stop_locale').on(t.stopId, t.locale),
    stopIdx: index('stop_locale_stop_idx').on(t.stopId),
  }),
)

// =============================================================================
// SETTINGS (Staging Only - Draft → Live)
// Pattern: draft + live pair, publish = UPSERT from draft
// =============================================================================

export const tourSettingsDraft = studioSchema.table(
  'tour_settings_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),

    themeId: uuid('theme_id'),
    settingsJson: text('settings_json'),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqTourSettingsDraft: uniqueIndex('uniq_tour_settings_draft').on(t.tourId),
  }),
)

export const tourSettings = studioSchema.table(
  'tour_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),

    themeId: uuid('theme_id'),
    settingsJson: text('settings_json'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqTourSettings: uniqueIndex('uniq_tour_settings').on(t.tourId),
  }),
)

export const stopSettingsDraft = studioSchema.table(
  'stop_settings_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    coordinates: varchar('coordinates', { length: 100 }),
    settingsJson: text('settings_json'),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopSettingsDraft: uniqueIndex('uniq_stop_settings_draft').on(t.stopId),
  }),
)

export const stopSettings = studioSchema.table(
  'stop_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    coordinates: varchar('coordinates', { length: 100 }),
    settingsJson: text('settings_json'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopSettings: uniqueIndex('uniq_stop_settings').on(t.stopId),
  }),
)

// =============================================================================
// STRUCTURE (Staging Only - Draft → Live)
// Links stops to tours with position and visibility
// =============================================================================

export const tourStopDraft = studioSchema.table(
  'tour_stop_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqTourStopDraft: uniqueIndex('uniq_tour_stop_draft').on(t.tourId, t.stopId),
    tourIdx: index('tour_stop_draft_tour_idx').on(t.tourId),
    stopIdx: index('tour_stop_draft_stop_idx').on(t.stopId),
    positionIdx: index('tour_stop_draft_position_idx').on(t.tourId, t.position),
  }),
)

export const tourStop = studioSchema.table(
  'tour_stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqTourStop: uniqueIndex('uniq_tour_stop').on(t.tourId, t.stopId),
    tourIdx: index('tour_stop_tour_idx').on(t.tourId),
    stopIdx: index('tour_stop_stop_idx').on(t.stopId),
    positionIdx: index('tour_stop_position_idx').on(t.tourId, t.position),
  }),
)

// =============================================================================
// ASSETS (Staging Only - Draft → Live)
// Channels: images.hero, images.gallery, audio.narration, audio.background, video.main
// Locale on assignment, not on asset file
// =============================================================================

export const tourAssetDraft = studioSchema.table(
  'tour_asset_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqTourAssetDraft: uniqueIndex('uniq_tour_asset_draft').on(t.tourId, t.assetId, t.channel, t.locale),
    tourIdx: index('tour_asset_draft_tour_idx').on(t.tourId),
    channelIdx: index('tour_asset_draft_channel_idx').on(t.tourId, t.channel),
    assetIdx: index('tour_asset_draft_asset_idx').on(t.assetId),
  }),
)

export const tourAsset = studioSchema.table(
  'tour_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqTourAsset: uniqueIndex('uniq_tour_asset').on(t.tourId, t.assetId, t.channel, t.locale),
    tourIdx: index('tour_asset_tour_idx').on(t.tourId),
    channelIdx: index('tour_asset_channel_idx').on(t.tourId, t.channel),
    assetIdx: index('tour_asset_asset_idx').on(t.assetId),
  }),
)

export const stopAssetDraft = studioSchema.table(
  'stop_asset_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqStopAssetDraft: uniqueIndex('uniq_stop_asset_draft').on(t.stopId, t.assetId, t.channel, t.locale),
    stopIdx: index('stop_asset_draft_stop_idx').on(t.stopId),
    channelIdx: index('stop_asset_draft_channel_idx').on(t.stopId, t.channel),
    assetIdx: index('stop_asset_draft_asset_idx').on(t.assetId),
  }),
)

export const stopAsset = studioSchema.table(
  'stop_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqStopAsset: uniqueIndex('uniq_stop_asset').on(t.stopId, t.assetId, t.channel, t.locale),
    stopIdx: index('stop_asset_stop_idx').on(t.stopId),
    channelIdx: index('stop_asset_channel_idx').on(t.stopId, t.channel),
    assetIdx: index('stop_asset_asset_idx').on(t.assetId),
  }),
)

// =============================================================================
// TYPES
// =============================================================================

// Base entities
export type Tour = typeof tour.$inferSelect
export type NewTour = typeof tour.$inferInsert
export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert

// Locale text (staging)
export type TourLocaleDraft = typeof tourLocaleDraft.$inferSelect
export type NewTourLocaleDraft = typeof tourLocaleDraft.$inferInsert
export type TourLocale = typeof tourLocale.$inferSelect
export type NewTourLocale = typeof tourLocale.$inferInsert
export type StopLocaleDraft = typeof stopLocaleDraft.$inferSelect
export type NewStopLocaleDraft = typeof stopLocaleDraft.$inferInsert
export type StopLocale = typeof stopLocale.$inferSelect
export type NewStopLocale = typeof stopLocale.$inferInsert

// Settings (staging)
export type TourSettingsDraft = typeof tourSettingsDraft.$inferSelect
export type TourSettings = typeof tourSettings.$inferSelect
export type StopSettingsDraft = typeof stopSettingsDraft.$inferSelect
export type StopSettings = typeof stopSettings.$inferSelect

// Structure (staging)
export type TourStopDraft = typeof tourStopDraft.$inferSelect
export type TourStop = typeof tourStop.$inferSelect

// Assets (staging)
export type TourAssetDraft = typeof tourAssetDraft.$inferSelect
export type TourAsset = typeof tourAsset.$inferSelect
export type StopAssetDraft = typeof stopAssetDraft.$inferSelect
export type StopAsset = typeof stopAsset.$inferSelect

// =============================================================================
// SLUGS (Draft/Published Pattern)
// - Draft slug: publishedAt IS NULL (0-1 per tour, overwritten on each save)
// - Published slugs: publishedAt IS NOT NULL (0-N per tour, one has isPrimary=true)
// =============================================================================

export const tourSlug = studioSchema.table(
  'tour_slug',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 200 }).notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqueOrgSlug: uniqueIndex('tour_slug_org_unique').on(t.organizationId, t.slug),
    uniquePrimary: uniqueIndex('tour_slug_primary_unique').on(t.tourId).where(sql`${t.isPrimary} = true`),
    tourIdx: index('tour_slug_tour_idx').on(t.tourId),
    slugLookupIdx: index('tour_slug_lookup_idx').on(t.organizationId, t.slug),
  }),
)

export const tourSlugRelations = relations(tourSlug, ({ one }) => ({
  tour: one(tour, {
    fields: [tourSlug.tourId],
    references: [tour.id],
  }),
  organization: one(organization, {
    fields: [tourSlug.organizationId],
    references: [organization.id],
  }),
}))

// Slug types
export type TourSlug = typeof tourSlug.$inferSelect
export type NewTourSlug = typeof tourSlug.$inferInsert
