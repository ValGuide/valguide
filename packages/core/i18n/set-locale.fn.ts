import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { supportedLocales } from './i18n.config'
import { setServerLocale } from './server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const setLocaleFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ locale: z.enum(supportedLocales) }))
  .handler(async ({ data }) => {
    setServerLocale(data.locale)
    return { success: true }
  })
