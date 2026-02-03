import { relations } from 'drizzle-orm'
import { index, integer, pgEnum, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import {
  guide,
  guideAsset,
  guideAssetDraft,
  guideLocale,
  guideLocaleDraft,
  guideSettings,
  guideSettingsDraft,
  guideStop,
  guideStopDraft,
  stop,
  stopAsset,
  stopAssetDraft,
  stopLocale,
  stopLocaleDraft,
  stopSettings,
  stopSettingsDraft,
} from '../guides/schema'
import { organization } from '../orgs/schema'

/**
 * ValGuide – Asset Schema v3.0 (February 2026)
 *
 * Assets are immutable file records.
 * Locale is on the assignment tables (guide_asset_draft, stop_asset_draft), not on the asset.
 *
 * See: docs/guide-stop-asset/target-schema.md
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

export const guideRelations = relations(guide, ({ many, one }) => ({
  localesDraft: many(guideLocaleDraft),
  locales: many(guideLocale),
  settingsDraft: one(guideSettingsDraft, {
    fields: [guide.id],
    references: [guideSettingsDraft.guideId],
  }),
  settings: one(guideSettings, {
    fields: [guide.id],
    references: [guideSettings.guideId],
  }),
  stopsDraft: many(guideStopDraft),
  stops: many(guideStop),
  assetsDraft: many(guideAssetDraft),
  assets: many(guideAsset),
  creator: one(authUsers, {
    fields: [guide.createdBy],
    references: [authUsers.id],
    relationName: 'guide_creator',
  }),
  updater: one(authUsers, {
    fields: [guide.updatedBy],
    references: [authUsers.id],
    relationName: 'guide_updater',
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
  guideStopsDraft: many(guideStopDraft),
  guideStops: many(guideStop),
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
export const guideLocaleDraftRelations = relations(guideLocaleDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideLocaleDraft.guideId],
    references: [guide.id],
  }),
  updater: one(authUsers, {
    fields: [guideLocaleDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const guideLocaleRelations = relations(guideLocale, ({ one }) => ({
  guide: one(guide, {
    fields: [guideLocale.guideId],
    references: [guide.id],
  }),
  publisher: one(authUsers, {
    fields: [guideLocale.publishedBy],
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
export const guideSettingsDraftRelations = relations(guideSettingsDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideSettingsDraft.guideId],
    references: [guide.id],
  }),
  updater: one(authUsers, {
    fields: [guideSettingsDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const guideSettingsRelations = relations(guideSettings, ({ one }) => ({
  guide: one(guide, {
    fields: [guideSettings.guideId],
    references: [guide.id],
  }),
  publisher: one(authUsers, {
    fields: [guideSettings.publishedBy],
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
export const guideStopDraftRelations = relations(guideStopDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideStopDraft.guideId],
    references: [guide.id],
  }),
  stop: one(stop, {
    fields: [guideStopDraft.stopId],
    references: [stop.id],
  }),
}))

export const guideStopRelations = relations(guideStop, ({ one }) => ({
  guide: one(guide, {
    fields: [guideStop.guideId],
    references: [guide.id],
  }),
  stop: one(stop, {
    fields: [guideStop.stopId],
    references: [stop.id],
  }),
}))

// Asset assignment relations
export const guideAssetDraftRelations = relations(guideAssetDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideAssetDraft.guideId],
    references: [guide.id],
  }),
  asset: one(asset, {
    fields: [guideAssetDraft.assetId],
    references: [asset.id],
  }),
}))

export const guideAssetRelations = relations(guideAsset, ({ one }) => ({
  guide: one(guide, {
    fields: [guideAsset.guideId],
    references: [guide.id],
  }),
  asset: one(asset, {
    fields: [guideAsset.assetId],
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
