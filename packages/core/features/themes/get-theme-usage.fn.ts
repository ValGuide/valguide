import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import type { ThemeUsageDetails } from './get-theme-usage.server'

export type { ThemeUsageDetails, ThemeUsageLocation, ThemeUsageScope } from './get-theme-usage.server'

const getThemeUsageSchema = z.object({
  themeId: z.string(),
})

export const getThemeUsageDetailsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getThemeUsageSchema)
  .handler(async ({ context, data }): Promise<ThemeUsageDetails> => {
    const [{ requireThemeAccess }, { getThemeUsage }] = await Promise.all([
      import('../auth/authorization'),
      import('./get-theme-usage.server'),
    ])

    await requireThemeAccess(data.themeId, context.user.id)
    return getThemeUsage(data.themeId)
  })
