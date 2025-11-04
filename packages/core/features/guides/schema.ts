import { pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
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

// Relations
export const guideRelations = relations(guide, ({ many, one }) => ({
  translations: many(guideTranslation),
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

// TypeScript types
export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type GuideTranslation = typeof guideTranslation.$inferSelect
export type NewGuideTranslation = typeof guideTranslation.$inferInsert

// Helper type for a guide with its translations
export type GuideWithTranslations = Guide & {
  translations: GuideTranslation[]
}

// Helper function to get localized text with fallback
export function getLocalizedGuideText(
  guide: GuideWithTranslations,
  field: 'title' | 'description',
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = 'en'
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

// Helper function to create a guide with translations
export function createGuideWithTranslations(
  guideData: Omit<NewGuide, 'id' | 'createdAt' | 'updatedAt'>,
  translations: Array<{ locale: string; title: string; description?: string }>
): { guide: NewGuide; translations: Omit<NewGuideTranslation, 'guideId' | 'id' | 'createdAt' | 'updatedAt'>[] } {
  return {
    guide: guideData,
    translations,
  }
}

