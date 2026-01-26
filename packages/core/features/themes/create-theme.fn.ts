import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { valguideId } from '../../utils/nanoid'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { type NewTheme, theme as themeTable } from './schema'
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
      createdBy: input.createdBy,
    } satisfies NewTheme)
    .returning()

  return created
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createThemeSchema = z.object({
  name: z.string().min(1),
  basePreset: z.string(),
  colors: z.any(),
  radius: z.number(),
  fonts: z.any(),
})

export const createThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createThemeSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(organizationId, context.user.id)

    const input: CreateThemeInput = {
      organizationId,
      name: data.name.trim(),
      basePreset: data.basePreset as ThemePreset,
      colors: data.colors as ThemeColors,
      radius: data.radius,
      fonts: data.fonts as ThemeFonts,
      createdBy: context.user.id,
    }

    return createTheme(input)
  })
