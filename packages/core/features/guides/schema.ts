import { relations } from 'drizzle-orm'
import { index, integer, pgEnum, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { organization } from '../orgs/schema'

const studioSchema = pgSchema('studio')

export const translationStatus = pgEnum('translation_status', ['draft', 'in_review', 'published', 'archived'])

export const guide = studioSchema.table(
  'guide',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_guide_nano_id'), // Generated with customAlphabet (10 chars)
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
    published: timestamp('published', { withTimezone: true }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    themeId: uuid('theme_id'),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    availableLocales: text('available_locales').array().notNull().default(['en', 'de', 'rm']),
  },
  (t) => ({
    orgIdx: index('guide_organization_id_idx').on(t.organizationId),
  }),
)

export const guideTranslation = studioSchema.table(
  'guide_translation',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(), // 'en', 'de', 'rm', etc.
    currentVersionId: uuid('current_version_id'), // Published version served to users
    draftVersionId: uuid('draft_version_id'), // Active draft for editing
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueTranslation: uniqueIndex('unique_guide_translation').on(t.guideId, t.locale),
    guideIdIdx: index('guide_translation_guide_id_idx').on(t.guideId),
  }),
)

export const guideTranslationVersion = studioSchema.table(
  'guide_translation_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    translationId: uuid('translation_id')
      .notNull()
      .references(() => guideTranslation.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: translationStatus('status').notNull().default('draft'),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqueVersion: uniqueIndex('unique_guide_translation_version').on(t.translationId, t.version),
    statusIndex: index('guide_translation_version_status_idx').on(t.translationId, t.status),
  }),
)

// Stop table (content points within a guide)
// Note: guideId and order are deprecated - use guideStop junction table instead
export const stop = studioSchema.table(
  'stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_stop_nano_id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    // Deprecated columns - kept for backward compatibility during migration
    guideId: uuid('guide_id').references(() => guide.id, { onDelete: 'set null' }),
    order: integer('order').default(0),
  },
  (t) => ({
    orgIdx: index('stop_organization_id_idx').on(t.organizationId),
  }),
)

// Junction table for many-to-many guide-stop relationship
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
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueStopPerGuide: uniqueIndex('uniq_guide_stop').on(t.guideId, t.stopId),
    guideIdx: index('guide_stop_guide_idx').on(t.guideId),
    stopIdx: index('guide_stop_stop_idx').on(t.stopId),
  }),
)

export const stopTranslation = studioSchema.table(
  'stop_translation',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),
    currentVersionId: uuid('current_version_id'), // Published version served to users
    draftVersionId: uuid('draft_version_id'), // Active draft for editing
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqueStopTranslation: uniqueIndex('unique_stop_translation').on(t.stopId, t.locale),
    stopIdIdx: index('stop_translation_stop_id_idx').on(t.stopId),
  }),
)

export const stopTranslationVersion = studioSchema.table(
  'stop_translation_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    translationId: uuid('translation_id')
      .notNull()
      .references(() => stopTranslation.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    status: translationStatus('status').notNull().default('draft'),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    transcription: text('transcription'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqueVersion: uniqueIndex('unique_stop_translation_version').on(t.translationId, t.version),
    statusIndex: index('stop_translation_version_status_idx').on(t.translationId, t.status),
  }),
)

// Relations
export const guideRelations = relations(guide, ({ many, one }) => ({
  translations: many(guideTranslation),
  guideStops: many(guideStop),
  // Deprecated: direct stop relation - use guideStops instead
  stops: many(stop),
  creator: one(authUsers, {
    fields: [guide.createdBy],
    references: [authUsers.id],
    relationName: 'creator',
  }),
  updater: one(authUsers, {
    fields: [guide.updatedBy],
    references: [authUsers.id],
    relationName: 'updater',
  }),
}))

export const guideTranslationRelations = relations(guideTranslation, ({ one, many }) => ({
  guide: one(guide, {
    fields: [guideTranslation.guideId],
    references: [guide.id],
  }),
  versions: many(guideTranslationVersion),
  currentVersion: one(guideTranslationVersion, {
    fields: [guideTranslation.currentVersionId],
    references: [guideTranslationVersion.id],
    relationName: 'currentVersion',
  }),
  draftVersion: one(guideTranslationVersion, {
    fields: [guideTranslation.draftVersionId],
    references: [guideTranslationVersion.id],
    relationName: 'draftVersion',
  }),
}))

export const guideTranslationVersionRelations = relations(guideTranslationVersion, ({ one }) => ({
  translation: one(guideTranslation, {
    fields: [guideTranslationVersion.translationId],
    references: [guideTranslation.id],
  }),
  creator: one(authUsers, {
    fields: [guideTranslationVersion.createdBy],
    references: [authUsers.id],
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

export const stopRelations = relations(stop, ({ many, one }) => ({
  guideStops: many(guideStop),
  // Deprecated: direct guide relation - use guideStops instead
  guide: one(guide, {
    fields: [stop.guideId],
    references: [guide.id],
  }),
  translations: many(stopTranslation),
  creator: one(authUsers, {
    fields: [stop.createdBy],
    references: [authUsers.id],
  }),
  organization: one(organization, {
    fields: [stop.organizationId],
    references: [organization.id],
  }),
}))

export const stopTranslationRelations = relations(stopTranslation, ({ one, many }) => ({
  stop: one(stop, {
    fields: [stopTranslation.stopId],
    references: [stop.id],
  }),
  versions: many(stopTranslationVersion),
  currentVersion: one(stopTranslationVersion, {
    fields: [stopTranslation.currentVersionId],
    references: [stopTranslationVersion.id],
    relationName: 'currentVersion',
  }),
  draftVersion: one(stopTranslationVersion, {
    fields: [stopTranslation.draftVersionId],
    references: [stopTranslationVersion.id],
    relationName: 'draftVersion',
  }),
}))

export const stopTranslationVersionRelations = relations(stopTranslationVersion, ({ one }) => ({
  translation: one(stopTranslation, {
    fields: [stopTranslationVersion.translationId],
    references: [stopTranslation.id],
  }),
  creator: one(authUsers, {
    fields: [stopTranslationVersion.createdBy],
    references: [authUsers.id],
  }),
}))

// TypeScript types
export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type GuideTranslation = typeof guideTranslation.$inferSelect
export type NewGuideTranslation = typeof guideTranslation.$inferInsert
export type GuideTranslationVersion = typeof guideTranslationVersion.$inferSelect
export type NewGuideTranslationVersion = typeof guideTranslationVersion.$inferInsert

export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert
export type StopTranslation = typeof stopTranslation.$inferSelect
export type NewStopTranslation = typeof stopTranslation.$inferInsert
export type StopTranslationVersion = typeof stopTranslationVersion.$inferSelect
export type NewStopTranslationVersion = typeof stopTranslationVersion.$inferInsert

export type GuideStop = typeof guideStop.$inferSelect
export type NewGuideStop = typeof guideStop.$inferInsert

// Helper types with versions
export type GuideTranslationWithVersion = GuideTranslation & {
  currentVersion?: GuideTranslationVersion | null
  draftVersion?: GuideTranslationVersion | null
  versions?: GuideTranslationVersion[]
}

export type StopTranslationWithVersion = StopTranslation & {
  currentVersion?: StopTranslationVersion | null
  draftVersion?: StopTranslationVersion | null
  versions?: StopTranslationVersion[]
}

export type GuideWithTranslations = Guide & {
  translations: GuideTranslationWithVersion[]
  availableLocales?: string[]
}

export type StopWithTranslations = Stop & {
  translations: StopTranslationWithVersion[]
}

// GuideStop with nested stop data
export type GuideStopWithStop = GuideStop & {
  stop: StopWithTranslations
}

// Guide with stops via junction table (preferred)
export type GuideWithGuideStops = Guide & {
  translations: GuideTranslationWithVersion[]
  guideStops: GuideStopWithStop[]
}

// Deprecated: Guide with direct stops relation (for backward compatibility)
export type GuideWithStops = Guide & {
  translations: GuideTranslationWithVersion[]
  stops: StopWithTranslations[]
  availableLocales?: string[]
}

/**
 * Convert GuideWithGuideStops (junction table format) to GuideWithStops (flat stops array)
 * Use this for backward compatibility with UI components that expect flat stops array
 */
export function toGuideWithStops(guide: GuideWithGuideStops): GuideWithStops {
  return {
    ...guide,
    stops: guide.guideStops.map((gs) => ({
      ...gs.stop,
      // Include position from junction table as order for backward compatibility
      order: gs.position,
    })),
  }
}

// Helper function to get localized text from current version with fallback
export function getLocalizedGuideText(
  guide: GuideWithTranslations,
  field: 'title' | 'description',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = guide.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = guide.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  // Return the first available translation
  const firstTranslation = guide.translations[0]
  return firstTranslation?.currentVersion?.[field] || ''
}

// Helper function to get localized stop text from current version with fallback
export function getLocalizedStopText(
  stop: StopWithTranslations,
  field: 'title' | 'description' | 'transcription',
  locale: string,
  fallbackLocale: string = 'en',
): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.[field]) {
    return translation.currentVersion[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.[field]) {
    return fallbackTranslation.currentVersion[field] || ''
  }

  // Return the first available translation
  const firstTranslation = stop.translations[0]
  return firstTranslation?.currentVersion?.[field] || ''
}
