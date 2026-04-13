import { relations } from 'drizzle-orm'
import { index, jsonb, numeric, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'
import { organization } from '../orgs/schema'
import type { ThemeAiGeneratedTheme, ThemeAiSourceImage, ThemeAiWebsiteContext } from './theme-ai.shared'
import { type ThemeColors, type ThemeFonts, themePresets } from './types'

const studioSchema = pgSchema('studio')

export const themePresetEnum = studioSchema.enum('theme_preset', [...themePresets])
export const themeAiGenerationStatusEnum = studioSchema.enum('theme_ai_generation_status', [
  'pending',
  'completed',
  'failed',
])

export const theme = studioSchema.table(
  'theme',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_theme_nano_id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    basePreset: themePresetEnum('base_preset').notNull(),
    colors: jsonb('colors').$type<ThemeColors>().notNull(),
    radius: numeric('radius', { precision: 3, scale: 1 }).notNull(),
    fonts: jsonb('fonts').$type<ThemeFonts>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqueNamePerOrg: uniqueIndex('theme_unique_name_per_org').on(t.organizationId, t.name),
    orgIdx: index('theme_org_idx').on(t.organizationId),
  }),
)

export const themeRelations = relations(theme, ({ one }) => ({
  organization: one(organization, {
    fields: [theme.organizationId],
    references: [organization.id],
  }),
  creator: one(authUsers, {
    fields: [theme.createdBy],
    references: [authUsers.id],
  }),
}))

export const themeAiGeneration = studioSchema.table(
  'theme_ai_generation',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_theme_ai_generation_nano_id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    sourceUrl: text('source_url'),
    notes: text('notes'),
    inputImages: jsonb('input_images').$type<ThemeAiSourceImage[]>().notNull().default([]),
    websiteContext: jsonb('website_context').$type<ThemeAiWebsiteContext | null>(),
    visualAnalysis: text('visual_analysis'),
    generatedTheme: jsonb('generated_theme').$type<ThemeAiGeneratedTheme | null>(),
    status: themeAiGenerationStatusEnum('status').notNull().default('pending'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    orgIdx: index('theme_ai_generation_org_idx').on(t.organizationId),
    createdAtIdx: index('theme_ai_generation_created_at_idx').on(t.createdAt),
  }),
)

export const themeAiGenerationRelations = relations(themeAiGeneration, ({ one }) => ({
  organization: one(organization, {
    fields: [themeAiGeneration.organizationId],
    references: [organization.id],
  }),
  creator: one(authUsers, {
    fields: [themeAiGeneration.createdBy],
    references: [authUsers.id],
  }),
}))

export type Theme = typeof theme.$inferSelect
export type NewTheme = typeof theme.$inferInsert
export type ThemeAiGeneration = typeof themeAiGeneration.$inferSelect
export type NewThemeAiGeneration = typeof themeAiGeneration.$inferInsert
