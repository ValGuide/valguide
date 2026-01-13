import { relations } from 'drizzle-orm'
import { index, integer, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
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

export const guideAsset = studioSchema.table(
  'guide_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    role: varchar('role', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    guideIdx: index('guide_asset_guide_id_idx').on(t.guideId),
  }),
)

export const stopAsset = studioSchema.table(
  'stop_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),
    order: integer('order').notNull().default(0),
    role: varchar('role', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    stopIdx: index('stop_asset_stop_id_idx').on(t.stopId),
  }),
)

// Relations
export const assetRelations = relations(asset, ({ many, one }) => ({
  guideAssets: many(guideAsset),
  stopAssets: many(stopAsset),
  uploader: one(authUsers, {
    fields: [asset.uploadedBy],
    references: [authUsers.id],
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

// TypeScript types
export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert
export type GuideAsset = typeof guideAsset.$inferSelect
export type NewGuideAsset = typeof guideAsset.$inferInsert
export type StopAsset = typeof stopAsset.$inferSelect
export type NewStopAsset = typeof stopAsset.$inferInsert

// Helper types
export type AssetWithRelations = Asset & {
  guideAssets: GuideAsset[]
  stopAssets: StopAsset[]
}

export type AssetType = 'image' | 'audio' | 'video'
