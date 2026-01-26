import { eq } from 'drizzle-orm'
import { db } from '../db'
import { type CreateThemeInput, createTheme } from './create-theme.server'
import { theme as themeTable } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function duplicateTheme(themeId: string, newName: string, createdBy?: string): Promise<Theme> {
  const [original] = await db.select().from(themeTable).where(eq(themeTable.id, themeId)).limit(1)

  if (!original) {
    throw new Error('Theme not found')
  }

  const input: CreateThemeInput = {
    organizationId: original.organizationId,
    name: newName,
    basePreset: original.basePreset,
    colors: original.colors,
    radius: Number(original.radius),
    fonts: original.fonts,
    createdBy,
  }

  return createTheme(input)
}
