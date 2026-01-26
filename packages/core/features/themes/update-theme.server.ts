import { eq } from 'drizzle-orm'
import { db } from '../db'
import { type NewTheme, theme as themeTable } from './schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

export interface UpdateThemeInput {
  id: string
  name?: string
  basePreset?: ThemePreset
  colors?: ThemeColors
  radius?: number
  fonts?: ThemeFonts
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateTheme(input: UpdateThemeInput): Promise<Theme> {
  const updates: Partial<NewTheme> = {}

  if (input.name !== undefined) updates.name = input.name
  if (input.basePreset !== undefined) updates.basePreset = input.basePreset
  if (input.colors !== undefined) updates.colors = input.colors
  if (input.radius !== undefined) updates.radius = String(input.radius)
  if (input.fonts !== undefined) updates.fonts = input.fonts

  const [updated] = await db.update(themeTable).set(updates).where(eq(themeTable.id, input.id)).returning()

  return updated
}
