import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccess } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { setTourTheme } from './set-tour-theme.server'

export type { TourSettingsDraft } from './set-tour-theme.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const setTourThemeSchema = z.object({
  tourId: z.string(),
  themeId: z.string().nullable(),
})

export const setTourThemeFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(setTourThemeSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccess(data.tourId, context.user.id)
    return setTourTheme(data.tourId, data.themeId)
  })
