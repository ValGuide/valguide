import { relations } from 'drizzle-orm'
import { index, integer, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { guide, stop } from '../guides/schema'

const studioSchema = pgSchema('studio')

export const asset = studioSchema.table(
  'asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_asset_nano_id'),

    // File metadata
    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),

    // Storage location
    storagePath: text('storage_path').notNull(),
    publicUrl: text('public_url'),

    // i18n support (optional - for language-specific assets)
    locale: varchar('locale', { length: 10 }),

    // Metadata
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'),

    // Organization & ownership
    organizationId: uuid('organization_id'),
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
    assetTypeOrgIdx: index('asset_type_org_idx').on(t.type, t.organizationId),
    orgIdx: index('asset_org_id_idx').on(t.organizationId),
  }),
)

// =============================================================================
// Guide Asset Versioning (matches guideTranslation pattern)
// =============================================================================

/**
 * Intermediate table for guide assets (like guideTranslation but without locale).
 * One row per guide. Points to current published and draft versions.
 */
export const guideAsset = studioSchema.table(
  'guide_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    // Version pointers - UUIDv7 pointing to versionId in guideAssetVersion
    currentVersionId: uuid('current_version_id'), // Published version
    draftVersionId: uuid('draft_version_id'), // Active draft for editing
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueGuideAsset: uniqueIndex('unique_guide_asset').on(t.guideId),
    guideIdx: index('guide_asset_guide_idx').on(t.guideId),
  }),
)

/**
 * Version content for guide assets. Multiple rows per version (one per asset item).
 * All rows in same version share the same versionId (UUIDv7).
 */
export const guideAssetVersion = studioSchema.table(
  'guide_asset_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideAssetId: uuid('guide_asset_id')
      .notNull()
      .references(() => guideAsset.id, { onDelete: 'cascade' }),
    // UUIDv7 - shared by all items in same version, pointed to by currentVersionId/draftVersionId
    versionId: uuid('version_id').notNull(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    role: varchar('role', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }), // null = shared across locales
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    versionIdx: index('guide_asset_version_version_idx').on(t.versionId),
    guideAssetIdx: index('guide_asset_version_guide_asset_idx').on(t.guideAssetId),
  }),
)

// =============================================================================
// Stop Asset Versioning (matches stopTranslation pattern)
// =============================================================================

/**
 * Intermediate table for stop assets (like stopTranslation but without locale).
 * One row per stop. Points to current published and draft versions.
 */
export const stopAsset = studioSchema.table(
  'stop_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    // Version pointers - UUIDv7 pointing to versionId in stopAssetVersion
    currentVersionId: uuid('current_version_id'), // Published version
    draftVersionId: uuid('draft_version_id'), // Active draft for editing
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueStopAsset: uniqueIndex('unique_stop_asset').on(t.stopId),
    stopIdx: index('stop_asset_stop_idx').on(t.stopId),
  }),
)

/**
 * Version content for stop assets. Multiple rows per version (one per asset item).
 * All rows in same version share the same versionId (UUIDv7).
 */
export const stopAssetVersion = studioSchema.table(
  'stop_asset_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopAssetId: uuid('stop_asset_id')
      .notNull()
      .references(() => stopAsset.id, { onDelete: 'cascade' }),
    // UUIDv7 - shared by all items in same version, pointed to by currentVersionId/draftVersionId
    versionId: uuid('version_id').notNull(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    role: varchar('role', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }), // null = shared across locales
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    versionIdx: index('stop_asset_version_version_idx').on(t.versionId),
    stopAssetIdx: index('stop_asset_version_stop_asset_idx').on(t.stopAssetId),
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
}))

export const guideAssetRelations = relations(guideAsset, ({ one, many }) => ({
  guide: one(guide, {
    fields: [guideAsset.guideId],
    references: [guide.id],
  }),
  versions: many(guideAssetVersion),
}))

export const guideAssetVersionRelations = relations(guideAssetVersion, ({ one }) => ({
  guideAsset: one(guideAsset, {
    fields: [guideAssetVersion.guideAssetId],
    references: [guideAsset.id],
  }),
  asset: one(asset, {
    fields: [guideAssetVersion.assetId],
    references: [asset.id],
  }),
  creator: one(authUsers, {
    fields: [guideAssetVersion.createdBy],
    references: [authUsers.id],
  }),
}))

export const stopAssetRelations = relations(stopAsset, ({ one, many }) => ({
  stop: one(stop, {
    fields: [stopAsset.stopId],
    references: [stop.id],
  }),
  versions: many(stopAssetVersion),
}))

export const stopAssetVersionRelations = relations(stopAssetVersion, ({ one }) => ({
  stopAsset: one(stopAsset, {
    fields: [stopAssetVersion.stopAssetId],
    references: [stopAsset.id],
  }),
  asset: one(asset, {
    fields: [stopAssetVersion.assetId],
    references: [asset.id],
  }),
  creator: one(authUsers, {
    fields: [stopAssetVersion.createdBy],
    references: [authUsers.id],
  }),
}))

// =============================================================================
// TypeScript Types
// =============================================================================

export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert

export type GuideAsset = typeof guideAsset.$inferSelect
export type NewGuideAsset = typeof guideAsset.$inferInsert
export type GuideAssetVersion = typeof guideAssetVersion.$inferSelect
export type NewGuideAssetVersion = typeof guideAssetVersion.$inferInsert

export type StopAsset = typeof stopAsset.$inferSelect
export type NewStopAsset = typeof stopAsset.$inferInsert
export type StopAssetVersion = typeof stopAssetVersion.$inferSelect
export type NewStopAssetVersion = typeof stopAssetVersion.$inferInsert

export type AssetType = 'image' | 'audio' | 'video'

// Asset with versions (for queries)
export type GuideAssetWithVersions = GuideAsset & {
  versions: (GuideAssetVersion & { asset: Asset })[]
}

export type StopAssetWithVersions = StopAsset & {
  versions: (StopAssetVersion & { asset: Asset })[]
}
