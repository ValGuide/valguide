import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type CreateThemeInput, createTheme } from './create-theme.server'
import type { ThemeColors, ThemeFonts, ThemePreset } from './types'

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
