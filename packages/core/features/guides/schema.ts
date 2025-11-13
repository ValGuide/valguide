import { pgSchema, text, timestamp, uniqueIndex, uuid, varchar, integer, index, pgEnum } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { relations } from 'drizzle-orm'
import type { SupportedLocale } from '../../i18n/i18n.config'

const studioSchema = pgSchema('studio')

export const translationStatus = pgEnum('translation_status', ['draft', 'in_review', 'published', 'archived'])

export const guide = studioSchema.table('guide', {
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
  coverImage: text('cover_image'),
  organizationId: uuid('organization_id'),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

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
export const stop = studioSchema.table('stop', {
  id: uuid('id').defaultRandom().primaryKey(),
  guideId: uuid('guide_id')
    .notNull()
    .references(() => guide.id, { onDelete: 'cascade' }),
  nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_stop_nano_id'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
})

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

export const stopRelations = relations(stop, ({ many, one }) => ({
  guide: one(guide, {
    fields: [stop.guideId],
    references: [guide.id],
  }),
  translations: many(stopTranslation),
  creator: one(authUsers, {
    fields: [stop.createdBy],
    references: [authUsers.id],
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
}

export type StopWithTranslations = Stop & {
  translations: StopTranslationWithVersion[]
}

export type GuideWithStops = Guide & {
  translations: GuideTranslationWithVersion[]
  stops: StopWithTranslations[]
}

// Helper function to get localized text from current version with fallback
export function getLocalizedGuideText(
  guide: GuideWithTranslations,
  field: 'title' | 'description',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
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
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
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
