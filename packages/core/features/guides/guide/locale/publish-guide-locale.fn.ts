import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { publishGuideLocale } from './publish-guide-locale.server'

export type { PublishGuideLocaleResult } from './publish-guide-locale.server'

const publishGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const publishGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return publishGuideLocale(data.nanoId, data.locale, context.user.id)
  })
