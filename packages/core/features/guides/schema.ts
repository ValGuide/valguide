import { pgSchema, text, timestamp, uniqueIndex, uuid, varchar, integer, index } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { relations } from 'drizzle-orm'
import type { SupportedLocale } from '../../i18n/i18n.config'

const studioSchema = pgSchema('studio')

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
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
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
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    transcription: text('transcription'),
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

export const guideTranslationRelations = relations(guideTranslation, ({ one }) => ({
  guide: one(guide, {
    fields: [guideTranslation.guideId],
    references: [guide.id],
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

export const stopTranslationRelations = relations(stopTranslation, ({ one }) => ({
  stop: one(stop, {
    fields: [stopTranslation.stopId],
    references: [stop.id],
  }),
}))

// TypeScript types
export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type GuideTranslation = typeof guideTranslation.$inferSelect
export type NewGuideTranslation = typeof guideTranslation.$inferInsert

export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert
export type StopTranslation = typeof stopTranslation.$inferSelect
export type NewStopTranslation = typeof stopTranslation.$inferInsert

// Helper type for a guide with its translations
export type GuideWithTranslations = Guide & {
  translations: GuideTranslation[]
}

export type StopWithTranslations = Stop & {
  translations: StopTranslation[]
}

export type GuideWithStops = Guide & {
  translations: GuideTranslation[]
  stops: StopWithTranslations[]
}

// Helper function to get localized text with fallback
export function getLocalizedGuideText(
  guide: GuideWithTranslations,
  field: 'title' | 'description',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
): string {
  const translation = guide.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = guide.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  // Return the first available translation
  const firstTranslation = guide.translations[0]
  return firstTranslation?.[field] || ''
}

// Helper function to get localized stop text with fallback
export function getLocalizedStopText(
  stop: StopWithTranslations,
  field: 'title' | 'description' | 'transcription',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en',
): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.[field]) {
    return translation[field] || ''
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.[field]) {
    return fallbackTranslation[field] || ''
  }

  // Return the first available translation
  const firstTranslation = stop.translations[0]
  return firstTranslation?.[field] || ''
}

// Helper function to create a guide with translations
export function createGuideWithTranslations(
  guideData: Omit<NewGuide, 'id' | 'createdAt' | 'updatedAt'>,
  translations: Array<{ locale: string; title: string; description?: string }>,
): { guide: NewGuide; translations: Omit<NewGuideTranslation, 'guideId' | 'id' | 'createdAt' | 'updatedAt'>[] } {
  return {
    guide: guideData,
    translations,
  }
}
