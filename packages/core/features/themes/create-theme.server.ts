import { valguideId } from '../../utils/nanoid'
import { db } from '../db'
import { type NewTheme, type ThemeMetadata, theme as themeTable } from './schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type Theme = typeof themeTable.$inferSelect

export interface CreateThemeInput {
  organizationId: string
  name: string
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
  metadata?: ThemeMetadata
  createdBy?: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function createTheme(input: CreateThemeInput): Promise<Theme> {
  const [created] = await db
    .insert(themeTable)
    .values({
      nanoId: valguideId(),
      organizationId: input.organizationId,
      name: input.name,
      basePreset: input.basePreset,
      colors: input.colors,
      radius: String(input.radius),
      fonts: input.fonts,
      metadata: input.metadata ?? null,
      createdBy: input.createdBy,
    } satisfies NewTheme)
    .returning()

  return created
}
