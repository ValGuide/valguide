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
 * See: docs/guide-stop-asset/target-schema.md
 */

const studioSchema = pgSchema('studio')

// =============================================================================
// BASE ENTITIES
// =============================================================================

export const guide = studioSchema.table(
  'guide',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_guide_nano_id'),

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
    guideOrgIdx: index('guide_org_idx').on(t.organizationId),
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

export const guideLocaleDraft = studioSchema.table(
  'guide_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
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
    uniqGuideLocaleDraft: uniqueIndex('uniq_guide_locale_draft').on(t.guideId, t.locale),
    guideIdx: index('guide_locale_draft_guide_idx').on(t.guideId),
  }),
)

export const guideLocale = studioSchema.table(
  'guide_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideLocale: uniqueIndex('uniq_guide_locale').on(t.guideId, t.locale),
    guideIdx: index('guide_locale_guide_idx').on(t.guideId),
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

export const guideSettingsDraft = studioSchema.table(
  'guide_settings_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    themeId: uuid('theme_id'),
    settingsJson: text('settings_json'),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideSettingsDraft: uniqueIndex('uniq_guide_settings_draft').on(t.guideId),
  }),
)

export const guideSettings = studioSchema.table(
  'guide_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    themeId: uuid('theme_id'),
    settingsJson: text('settings_json'),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideSettings: uniqueIndex('uniq_guide_settings').on(t.guideId),
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
// Links stops to guides with position and visibility
// =============================================================================

export const guideStopDraft = studioSchema.table(
  'guide_stop_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideStopDraft: uniqueIndex('uniq_guide_stop_draft').on(t.guideId, t.stopId),
    guideIdx: index('guide_stop_draft_guide_idx').on(t.guideId),
    stopIdx: index('guide_stop_draft_stop_idx').on(t.stopId),
    positionIdx: index('guide_stop_draft_position_idx').on(t.guideId, t.position),
  }),
)

export const guideStop = studioSchema.table(
  'guide_stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideStop: uniqueIndex('uniq_guide_stop').on(t.guideId, t.stopId),
    guideIdx: index('guide_stop_guide_idx').on(t.guideId),
    stopIdx: index('guide_stop_stop_idx').on(t.stopId),
    positionIdx: index('guide_stop_position_idx').on(t.guideId, t.position),
  }),
)

// =============================================================================
// ASSETS (Staging Only - Draft → Live)
// Channels: images.hero, images.gallery, audio.narration, audio.background, video.main
// Locale on assignment, not on asset file
// =============================================================================

export const guideAssetDraft = studioSchema.table(
  'guide_asset_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideAssetDraft: uniqueIndex('uniq_guide_asset_draft').on(t.guideId, t.assetId, t.channel, t.locale),
    guideIdx: index('guide_asset_draft_guide_idx').on(t.guideId),
    channelIdx: index('guide_asset_draft_channel_idx').on(t.guideId, t.channel),
    assetIdx: index('guide_asset_draft_asset_idx').on(t.assetId),
  }),
)

export const guideAsset = studioSchema.table(
  'guide_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id').notNull(),

    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideAsset: uniqueIndex('uniq_guide_asset').on(t.guideId, t.assetId, t.channel, t.locale),
    guideIdx: index('guide_asset_guide_idx').on(t.guideId),
    channelIdx: index('guide_asset_channel_idx').on(t.guideId, t.channel),
    assetIdx: index('guide_asset_asset_idx').on(t.assetId),
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
export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert

// Locale text (staging)
export type GuideLocaleDraft = typeof guideLocaleDraft.$inferSelect
export type NewGuideLocaleDraft = typeof guideLocaleDraft.$inferInsert
export type GuideLocale = typeof guideLocale.$inferSelect
export type NewGuideLocale = typeof guideLocale.$inferInsert
export type StopLocaleDraft = typeof stopLocaleDraft.$inferSelect
export type NewStopLocaleDraft = typeof stopLocaleDraft.$inferInsert
export type StopLocale = typeof stopLocale.$inferSelect
export type NewStopLocale = typeof stopLocale.$inferInsert

// Settings (staging)
export type GuideSettingsDraft = typeof guideSettingsDraft.$inferSelect
export type GuideSettings = typeof guideSettings.$inferSelect
export type StopSettingsDraft = typeof stopSettingsDraft.$inferSelect
export type StopSettings = typeof stopSettings.$inferSelect

// Structure (staging)
export type GuideStopDraft = typeof guideStopDraft.$inferSelect
export type GuideStop = typeof guideStop.$inferSelect

// Assets (staging)
export type GuideAssetDraft = typeof guideAssetDraft.$inferSelect
export type GuideAsset = typeof guideAsset.$inferSelect
export type StopAssetDraft = typeof stopAssetDraft.$inferSelect
export type StopAsset = typeof stopAsset.$inferSelect
