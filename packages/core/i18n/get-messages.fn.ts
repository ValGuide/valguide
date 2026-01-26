import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { defaultLocale, supportedLocales } from './i18n.config'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getMessagesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ locale: z.enum(supportedLocales) }))
  .handler(async ({ data }) => {
    const locale = data.locale
    try {
      return (await import(`./messages/${locale}.json`)).default
    } catch {
      return (await import(`./messages/${defaultLocale}.json`)).default
    }
  })
