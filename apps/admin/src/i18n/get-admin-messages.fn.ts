import { createServerFn } from '@tanstack/react-start'
import { defaultLocale, supportedLocales } from '@valguide/core/i18n/i18n.config'
import { z } from 'zod'

export const getAdminMessagesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ locale: z.enum(supportedLocales) }))
  .handler(async ({ data }) => {
    const locale = data.locale
    try {
      return (await import(`./messages/${locale}.json`)).default
    } catch {
      return (await import(`./messages/${defaultLocale}.json`)).default
    }
  })
