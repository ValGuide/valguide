import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireThemeAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { normalizeThemeFonts } from './fonts'
import type { ThemeColors, ThemeFonts, ThemePreset } from './types'
import { type UpdateThemeInput, updateTheme } from './update-theme.server'

export type { Theme } from './update-theme.server'

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
    if (data.fonts !== undefined) input.fonts = normalizeThemeFonts(data.fonts as ThemeFonts, { strict: true })

    const updated = await updateTheme(input)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'theme.updated',
      properties: {
        theme_id: updated.id,
        theme_preset: updated.basePreset,
      },
    })
    return updated
  })
