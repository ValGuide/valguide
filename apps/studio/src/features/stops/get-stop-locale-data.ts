import { createServerFn } from '@tanstack/react-start'
import { getStopTranslationForLocale } from '@valguide/core/features/guides/stop-queries'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getStopLocaleDataInputSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const getStopLocaleDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopLocaleDataInputSchema)
  .handler(async ({ data }) => {
    const localeData = await getStopTranslationForLocale(data.stopId, data.locale)
    return localeData
  })
