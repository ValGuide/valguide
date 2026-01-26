import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { unpublishGuideLocale } from './unpublish-guide-locale.server'

export type { UnpublishGuideLocaleResult } from './unpublish-guide-locale.server'

const unpublishGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const unpublishGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return unpublishGuideLocale(data.nanoId, data.locale)
  })
