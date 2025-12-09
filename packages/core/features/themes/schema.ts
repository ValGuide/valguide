import { relations } from 'drizzle-orm'
import { index, jsonb, numeric, pgEnum, pgSchema, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { organization } from '../orgs/schema'
import type { ThemeColors, ThemeFonts } from './types'

const studioSchema = pgSchema('studio')

export const themePresetEnum = pgEnum('theme_preset', [
  'light',
  'dark',
  'blue',
  'blue-dark',
  'green',
  'green-dark',
  'purple',
  'purple-dark',
])

export const customTheme = studioSchema.table(
  'custom_theme',
  {
    id: uuid('id').defaultRandom().primaryKey(),
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
    uniqueNamePerOrg: uniqueIndex('custom_theme_unique_name_per_org').on(t.organizationId, t.name),
    orgIdx: index('custom_theme_org_idx').on(t.organizationId),
  }),
)

export const customThemeRelations = relations(customTheme, ({ one }) => ({
  organization: one(organization, {
    fields: [customTheme.organizationId],
    references: [organization.id],
  }),
  creator: one(authUsers, {
    fields: [customTheme.createdBy],
    references: [authUsers.id],
  }),
}))

export type CustomTheme = typeof customTheme.$inferSelect
export type NewCustomTheme = typeof customTheme.$inferInsert
