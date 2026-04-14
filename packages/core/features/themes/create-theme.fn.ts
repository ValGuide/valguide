import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { type CreateThemeInput, createTheme } from './create-theme.server'
import { normalizeThemeFonts } from './fonts'

export type { Theme } from './create-theme.server'

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
  metadata: z
    .object({
      origin: z.literal('ai'),
      aiGenerationNanoId: z.string().min(10).max(21),
    })
    .nullable()
    .optional(),
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
      fonts: normalizeThemeFonts(data.fonts as ThemeFonts, { strict: true }),
      metadata: data.metadata ?? null,
      createdBy: context.user.id,
    }

    const created = await createTheme(input)
    captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'theme.created',
      properties: {
        theme_id: created.id,
        theme_preset: created.basePreset,
      },
    })
    return created
  })
