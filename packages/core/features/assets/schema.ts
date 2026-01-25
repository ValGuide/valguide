import { relations } from 'drizzle-orm'
import { index, integer, pgEnum, pgSchema, primaryKey, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { guide, guideCore, guideCoreDraft, guideCoreVersion, guideLocale, guideLocaleDraft, guideLocaleVersion, guideStop, stop, stopCore, stopCoreDraft, stopCoreVersion, stopLocale, stopLocaleDraft, stopLocaleVersion } from '../guides/schema'
import { organization } from '../orgs/schema'

const studioSchema = pgSchema('studio')


export const assetType = pgEnum('asset_type', ['image', 'audio', 'video'])

export const asset = studioSchema.table(
  'asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_asset_nano_id'),

    // File metadata
    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    type: assetType('type').notNull(),

    // Storage location
    storagePath: text('storage_path').notNull(),
    publicUrl: text('public_url'),

    // Optional file metadata
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'),

    // Ownership
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
// ASSETS (versioned lists): scope + set_draft/items + set_version/items
// =============================================================================

/**
 * Channels are strings (e.g. "images.hero", "audio.narration").
 * locale is nullable: NULL = global assets, locale = localized assets.
 */

export const guideAssetScope = studioSchema.table(
  'guide_asset_scope',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    locale: varchar('locale', { length: 10 }), // nullable
    channel: varchar('channel', { length: 120 }).notNull(),

    draftSetId: uuid('draft_set_id').notNull(),
    publishedSetId: uuid('published_set_id'),

    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqGuideAssetScope: uniqueIndex('uniq_guide_asset_scope').on(t.guideId, t.locale, t.channel),
    guideIdx: index('guide_asset_scope_guide_idx').on(t.guideId),
    channelIdx: index('guide_asset_scope_channel_idx').on(t.channel),
  }),
)

export const stopAssetScope = studioSchema.table(
  'stop_asset_scope',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    locale: varchar('locale', { length: 10 }),
    channel: varchar('channel', { length: 120 }).notNull(),

    draftSetId: uuid('draft_set_id').notNull(),
    publishedSetId: uuid('published_set_id'),

    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqStopAssetScope: uniqueIndex('uniq_stop_asset_scope').on(t.stopId, t.locale, t.channel),
    stopIdx: index('stop_asset_scope_stop_idx').on(t.stopId),
    channelIdx: index('stop_asset_scope_channel_idx').on(t.channel),
  }),
)

export const assetSetDraft = studioSchema.table(
  'asset_set_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Exactly one draft set per scope: enforced by unique index on (scopeType, scopeId)
    // Using (scope_table, scope_id) avoids needing separate tables for guide/stop draft sets.
    scopeTable: varchar('scope_table', { length: 20 }).notNull(), // 'guide_asset_scope' | 'stop_asset_scope'
    scopeId: uuid('scope_id').notNull(),

    revision: integer('revision').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqDraftPerScope: uniqueIndex('uniq_asset_set_draft_per_scope').on(t.scopeTable, t.scopeId),
    scopeIdx: index('asset_set_draft_scope_idx').on(t.scopeTable, t.scopeId),
  }),
)

export const assetSetDraftItem = studioSchema.table(
  'asset_set_draft_item',
  {
    draftSetId: uuid('draft_set_id')
      .notNull()
      .references(() => assetSetDraft.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.draftSetId, t.assetId, t.position], name: 'pk_asset_set_draft_item' }),
    uniqPosition: uniqueIndex('uniq_asset_set_draft_item_position').on(t.draftSetId, t.position),
    draftIdx: index('asset_set_draft_item_draft_idx').on(t.draftSetId),
    assetIdx: index('asset_set_draft_item_asset_idx').on(t.assetId),
  }),
)

export const assetSetVersion = studioSchema.table(
  'asset_set_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    scopeTable: varchar('scope_table', { length: 20 }).notNull(), // 'guide_asset_scope' | 'stop_asset_scope'
    scopeId: uuid('scope_id').notNull(),

    version: integer('version').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqVersionPerScope: uniqueIndex('uniq_asset_set_version_per_scope').on(t.scopeTable, t.scopeId, t.version),
    scopeIdx: index('asset_set_version_scope_idx').on(t.scopeTable, t.scopeId),
  }),
)

export const assetSetVersionItem = studioSchema.table(
  'asset_set_version_item',
  {
    versionSetId: uuid('version_set_id')
      .notNull()
      .references(() => assetSetVersion.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.versionSetId, t.assetId, t.position], name: 'pk_asset_set_version_item' }),
    uniqPosition: uniqueIndex('uniq_asset_set_version_item_position').on(t.versionSetId, t.position),
    versionIdx: index('asset_set_version_item_version_idx').on(t.versionSetId),
    assetIdx: index('asset_set_version_item_asset_idx').on(t.assetId),
  }),
)

// =============================================================================
// Relations
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
  guideStops: many(guideStop),
  locales: many(guideLocale),
  core: one(guideCore, {
    fields: [guide.id],
    references: [guideCore.guideId],
  }),
  creator: one(authUsers, { fields: [guide.createdBy], references: [authUsers.id], relationName: 'guide_creator' }),
  updater: one(authUsers, { fields: [guide.updatedBy], references: [authUsers.id], relationName: 'guide_updater' }),
}))

export const stopRelations = relations(stop, ({ many, one }) => ({
  guideStops: many(guideStop),
  locales: many(stopLocale),
  core: one(stopCore, {
    fields: [stop.id],
    references: [stopCore.stopId],
  }),
  creator: one(authUsers, { fields: [stop.createdBy], references: [authUsers.id], relationName: 'stop_creator' }),
  updater: one(authUsers, { fields: [stop.updatedBy], references: [authUsers.id], relationName: 'stop_updater' }),
}))

export const guideStopRelations = relations(guideStop, ({ one }) => ({
  guide: one(guide, { fields: [guideStop.guideId], references: [guide.id] }),
  stop: one(stop, { fields: [guideStop.stopId], references: [stop.id] }),
}))

export const guideLocaleRelations = relations(guideLocale, ({ one, many }) => ({
  guide: one(guide, { fields: [guideLocale.guideId], references: [guide.id] }),
  draft: one(guideLocaleDraft, {
    fields: [guideLocale.draftId],
    references: [guideLocaleDraft.id],
    relationName: 'guide_locale_draft_ptr',
  }),
  publishedVersion: one(guideLocaleVersion, {
    fields: [guideLocale.publishedVersionId],
    references: [guideLocaleVersion.id],
    relationName: 'guide_locale_published_ptr',
  }),
  versions: many(guideLocaleVersion),
}))

export const guideLocaleDraftRelations = relations(guideLocaleDraft, ({ one }) => ({
  locale: one(guideLocale, { fields: [guideLocaleDraft.guideLocaleId], references: [guideLocale.id] }),
  updater: one(authUsers, { fields: [guideLocaleDraft.updatedBy], references: [authUsers.id] }),
}))

export const guideLocaleVersionRelations = relations(guideLocaleVersion, ({ one }) => ({
  locale: one(guideLocale, { fields: [guideLocaleVersion.guideLocaleId], references: [guideLocale.id] }),
  creator: one(authUsers, { fields: [guideLocaleVersion.createdBy], references: [authUsers.id] }),
}))

export const stopLocaleRelations = relations(stopLocale, ({ one, many }) => ({
  stop: one(stop, { fields: [stopLocale.stopId], references: [stop.id] }),
  draft: one(stopLocaleDraft, {
    fields: [stopLocale.draftId],
    references: [stopLocaleDraft.id],
    relationName: 'stop_locale_draft_ptr',
  }),
  publishedVersion: one(stopLocaleVersion, {
    fields: [stopLocale.publishedVersionId],
    references: [stopLocaleVersion.id],
    relationName: 'stop_locale_published_ptr',
  }),
  versions: many(stopLocaleVersion),
}))

export const stopLocaleDraftRelations = relations(stopLocaleDraft, ({ one }) => ({
  locale: one(stopLocale, { fields: [stopLocaleDraft.stopLocaleId], references: [stopLocale.id] }),
  updater: one(authUsers, { fields: [stopLocaleDraft.updatedBy], references: [authUsers.id] }),
}))

export const stopLocaleVersionRelations = relations(stopLocaleVersion, ({ one }) => ({
  locale: one(stopLocale, { fields: [stopLocaleVersion.stopLocaleId], references: [stopLocale.id] }),
  creator: one(authUsers, { fields: [stopLocaleVersion.createdBy], references: [authUsers.id] }),
}))

export const guideCoreRelations = relations(guideCore, ({ one, many }) => ({
  guide: one(guide, { fields: [guideCore.guideId], references: [guide.id] }),
  draft: one(guideCoreDraft, {
    fields: [guideCore.draftId],
    references: [guideCoreDraft.id],
    relationName: 'guide_core_draft_ptr',
  }),
  publishedVersion: one(guideCoreVersion, {
    fields: [guideCore.publishedVersionId],
    references: [guideCoreVersion.id],
    relationName: 'guide_core_published_ptr',
  }),
  versions: many(guideCoreVersion),
}))

export const guideCoreDraftRelations = relations(guideCoreDraft, ({ one }) => ({
  core: one(guideCore, { fields: [guideCoreDraft.guideCoreId], references: [guideCore.id] }),
  updater: one(authUsers, { fields: [guideCoreDraft.updatedBy], references: [authUsers.id] }),
}))

export const guideCoreVersionRelations = relations(guideCoreVersion, ({ one }) => ({
  core: one(guideCore, { fields: [guideCoreVersion.guideCoreId], references: [guideCore.id] }),
  creator: one(authUsers, { fields: [guideCoreVersion.createdBy], references: [authUsers.id] }),
}))

export const stopCoreRelations = relations(stopCore, ({ one, many }) => ({
  stop: one(stop, { fields: [stopCore.stopId], references: [stop.id] }),
  draft: one(stopCoreDraft, {
    fields: [stopCore.draftId],
    references: [stopCoreDraft.id],
    relationName: 'stop_core_draft_ptr',
  }),
  publishedVersion: one(stopCoreVersion, {
    fields: [stopCore.publishedVersionId],
    references: [stopCoreVersion.id],
    relationName: 'stop_core_published_ptr',
  }),
  versions: many(stopCoreVersion),
}))

export const stopCoreDraftRelations = relations(stopCoreDraft, ({ one }) => ({
  core: one(stopCore, { fields: [stopCoreDraft.stopCoreId], references: [stopCore.id] }),
  updater: one(authUsers, { fields: [stopCoreDraft.updatedBy], references: [authUsers.id] }),
}))

export const stopCoreVersionRelations = relations(stopCoreVersion, ({ one }) => ({
  core: one(stopCore, { fields: [stopCoreVersion.stopCoreId], references: [stopCore.id] }),
  creator: one(authUsers, { fields: [stopCoreVersion.createdBy], references: [authUsers.id] }),
}))

export const guideAssetScopeRelations = relations(guideAssetScope, ({ one }) => ({
  guide: one(guide, { fields: [guideAssetScope.guideId], references: [guide.id] }),
  // NOTE: draftSetId/publishedSetId are polymorphic to assetSetDraft/assetSetVersion;
  // you’ll resolve them by querying asset_set_* where scopeTable/scopeId match this scope.
}))

export const stopAssetScopeRelations = relations(stopAssetScope, ({ one }) => ({
  stop: one(stop, { fields: [stopAssetScope.stopId], references: [stop.id] }),
}))

export const assetSetDraftRelations = relations(assetSetDraft, ({ many }) => ({
  items: many(assetSetDraftItem),
}))

export const assetSetDraftItemRelations = relations(assetSetDraftItem, ({ one }) => ({
  draftSet: one(assetSetDraft, { fields: [assetSetDraftItem.draftSetId], references: [assetSetDraft.id] }),
  asset: one(asset, { fields: [assetSetDraftItem.assetId], references: [asset.id] }),
}))

export const assetSetVersionRelations = relations(assetSetVersion, ({ many }) => ({
  items: many(assetSetVersionItem),
}))

export const assetSetVersionItemRelations = relations(assetSetVersionItem, ({ one }) => ({
  versionSet: one(assetSetVersion, { fields: [assetSetVersionItem.versionSetId], references: [assetSetVersion.id] }),
  asset: one(asset, { fields: [assetSetVersionItem.assetId], references: [asset.id] }),
}))

// =============================================================================
// Types
// =============================================================================

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert
export type AssetType = (typeof assetType.enumValues)[number]

export type GuideAssetScope = typeof guideAssetScope.$inferSelect
export type StopAssetScope = typeof stopAssetScope.$inferSelect

export type AssetSetDraft = typeof assetSetDraft.$inferSelect
export type AssetSetDraftItem = typeof assetSetDraftItem.$inferSelect
export type AssetSetVersion = typeof assetSetVersion.$inferSelect
export type AssetSetVersionItem = typeof assetSetVersionItem.$inferSelect