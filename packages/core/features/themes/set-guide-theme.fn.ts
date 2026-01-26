import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { setGuideTheme } from './set-guide-theme.server'

export type { GuideSettingsDraft } from './set-guide-theme.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const setGuideThemeSchema = z.object({
  guideId: z.string(),
  themeId: z.string().nullable(),
})

export const setGuideThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(setGuideThemeSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return setGuideTheme(data.guideId, data.themeId)
  })
