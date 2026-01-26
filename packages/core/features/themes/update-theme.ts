import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateThemeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  basePreset: z.string().optional(),
  colors: z.any().optional(),
  radius: z.number().optional(),
  fonts: z.any().optional(),
})

export const updateThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateThemeSchema)
  .handler(async ({ context, data }) => {
    await requireThemeAccess(data.id, context.user.id)

    const input: UpdateThemeInput = { id: data.id }

    if (data.name !== undefined) input.name = data.name.trim()
    if (data.basePreset !== undefined) input.basePreset = data.basePreset as ThemePreset
    if (data.colors !== undefined) input.colors = data.colors as ThemeColors
    if (data.radius !== undefined) input.radius = data.radius
    if (data.fonts !== undefined) input.fonts = data.fonts as ThemeFonts

    return updateTheme(input)
  })
