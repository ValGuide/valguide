import { relations } from 'drizzle-orm'
import { index, integer, pgEnum, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { organization } from '../orgs/schema'
import {
  stop,
  stopAsset,
  stopAssetDraft,
  stopLocale,
  stopLocaleDraft,
  stopSettings,
  stopSettingsDraft,
  tour,
  tourAsset,
  tourAssetDraft,
  tourLocale,
  tourLocaleDraft,
  tourSettings,
  tourSettingsDraft,
  tourStop,
  tourStopDraft,
} from '../tours/schema'

/**
 * ValGuide – Asset Schema v3.0 (February 2026)
 *
 * Assets are immutable file records.
 * Locale is on the assignment tables (tour_asset_draft, stop_asset_draft), not on the asset.
 *
 * See: docs/tour-stop-asset/target-schema.md
 */

const studioSchema = pgSchema('studio')

// =============================================================================
// ASSET (Base Entity - Immutable File Record)
// =============================================================================

export const assetType = pgEnum('asset_type', ['image', 'audio', 'video'])

export const asset = studioSchema.table(
  'asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_asset_nano_id'),

    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    type: assetType('type').notNull(),

    storagePath: text('storage_path').notNull(),
    publicUrl: text('public_url'),

    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    assetOrgIdx: index('asset_org_idx').on(t.organizationId),
    assetTypeOrgIdx: index('asset_type_org_idx').on(t.type, t.organizationId),
  }),
)

// =============================================================================
// RELATIONS
// =============================================================================

export const assetRelations = relations(asset, ({ one }) => ({
  uploader: one(authUsers, {
    fields: [asset.uploadedBy],
    references: [authUsers.id],
  }),
  org: one(organization, {
    fields: [asset.organizationId],
    references: [organization.id],
  }),
}))

export const tourRelations = relations(tour, ({ many, one }) => ({
  localesDraft: many(tourLocaleDraft),
  locales: many(tourLocale),
  settingsDraft: one(tourSettingsDraft, {
    fields: [tour.id],
    references: [tourSettingsDraft.tourId],
  }),
  settings: one(tourSettings, {
    fields: [tour.id],
    references: [tourSettings.tourId],
  }),
  stopsDraft: many(tourStopDraft),
  stops: many(tourStop),
  assetsDraft: many(tourAssetDraft),
  assets: many(tourAsset),
  creator: one(authUsers, {
    fields: [tour.createdBy],
    references: [authUsers.id],
    relationName: 'tour_creator',
  }),
  updater: one(authUsers, {
    fields: [tour.updatedBy],
    references: [authUsers.id],
    relationName: 'tour_updater',
  }),
}))

export const stopRelations = relations(stop, ({ many, one }) => ({
  localesDraft: many(stopLocaleDraft),
  locales: many(stopLocale),
  settingsDraft: one(stopSettingsDraft, {
    fields: [stop.id],
    references: [stopSettingsDraft.stopId],
  }),
  settings: one(stopSettings, {
    fields: [stop.id],
    references: [stopSettings.stopId],
  }),
  tourStopsDraft: many(tourStopDraft),
  tourStops: many(tourStop),
  assetsDraft: many(stopAssetDraft),
  assets: many(stopAsset),
  creator: one(authUsers, {
    fields: [stop.createdBy],
    references: [authUsers.id],
    relationName: 'stop_creator',
  }),
  updater: one(authUsers, {
    fields: [stop.updatedBy],
    references: [authUsers.id],
    relationName: 'stop_updater',
  }),
}))

// Locale relations (simplified - no version table)
export const tourLocaleDraftRelations = relations(tourLocaleDraft, ({ one }) => ({
  tour: one(tour, {
    fields: [tourLocaleDraft.tourId],
    references: [tour.id],
  }),
  updater: one(authUsers, {
    fields: [tourLocaleDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const tourLocaleRelations = relations(tourLocale, ({ one }) => ({
  tour: one(tour, {
    fields: [tourLocale.tourId],
    references: [tour.id],
  }),
  publisher: one(authUsers, {
    fields: [tourLocale.publishedBy],
    references: [authUsers.id],
  }),
}))

export const stopLocaleDraftRelations = relations(stopLocaleDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopLocaleDraft.stopId],
    references: [stop.id],
  }),
  updater: one(authUsers, {
    fields: [stopLocaleDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const stopLocaleRelations = relations(stopLocale, ({ one }) => ({
  stop: one(stop, {
    fields: [stopLocale.stopId],
    references: [stop.id],
  }),
  publisher: one(authUsers, {
    fields: [stopLocale.publishedBy],
    references: [authUsers.id],
  }),
}))

// Settings relations
export const tourSettingsDraftRelations = relations(tourSettingsDraft, ({ one }) => ({
  tour: one(tour, {
    fields: [tourSettingsDraft.tourId],
    references: [tour.id],
  }),
  updater: one(authUsers, {
    fields: [tourSettingsDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const tourSettingsRelations = relations(tourSettings, ({ one }) => ({
  tour: one(tour, {
    fields: [tourSettings.tourId],
    references: [tour.id],
  }),
  publisher: one(authUsers, {
    fields: [tourSettings.publishedBy],
    references: [authUsers.id],
  }),
}))

export const stopSettingsDraftRelations = relations(stopSettingsDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopSettingsDraft.stopId],
    references: [stop.id],
  }),
  updater: one(authUsers, {
    fields: [stopSettingsDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const stopSettingsRelations = relations(stopSettings, ({ one }) => ({
  stop: one(stop, {
    fields: [stopSettings.stopId],
    references: [stop.id],
  }),
  publisher: one(authUsers, {
    fields: [stopSettings.publishedBy],
    references: [authUsers.id],
  }),
}))

// Structure relations
export const tourStopDraftRelations = relations(tourStopDraft, ({ one }) => ({
  tour: one(tour, {
    fields: [tourStopDraft.tourId],
    references: [tour.id],
  }),
  stop: one(stop, {
    fields: [tourStopDraft.stopId],
    references: [stop.id],
  }),
}))

export const tourStopRelations = relations(tourStop, ({ one }) => ({
  tour: one(tour, {
    fields: [tourStop.tourId],
    references: [tour.id],
  }),
  stop: one(stop, {
    fields: [tourStop.stopId],
    references: [stop.id],
  }),
}))

// Asset assignment relations
export const tourAssetDraftRelations = relations(tourAssetDraft, ({ one }) => ({
  tour: one(tour, {
    fields: [tourAssetDraft.tourId],
    references: [tour.id],
  }),
  asset: one(asset, {
    fields: [tourAssetDraft.assetId],
    references: [asset.id],
  }),
}))

export const tourAssetRelations = relations(tourAsset, ({ one }) => ({
  tour: one(tour, {
    fields: [tourAsset.tourId],
    references: [tour.id],
  }),
  asset: one(asset, {
    fields: [tourAsset.assetId],
    references: [asset.id],
  }),
}))

export const stopAssetDraftRelations = relations(stopAssetDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopAssetDraft.stopId],
    references: [stop.id],
  }),
  asset: one(asset, {
    fields: [stopAssetDraft.assetId],
    references: [asset.id],
  }),
}))

export const stopAssetRelations = relations(stopAsset, ({ one }) => ({
  stop: one(stop, {
    fields: [stopAsset.stopId],
    references: [stop.id],
  }),
  asset: one(asset, {
    fields: [stopAsset.assetId],
    references: [asset.id],
  }),
}))

// =============================================================================
// TYPES
// =============================================================================

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert
export type AssetType = (typeof assetType.enumValues)[number]
