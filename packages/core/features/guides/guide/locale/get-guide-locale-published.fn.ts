import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getGuideLocalePublished } from './get-guide-locale-published.server'

export type { GuideLocalePublishedResult } from './get-guide-locale-published.server'

const getGuideLocalePublishedSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getGuideLocalePublishedFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideLocalePublishedSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)
    return getGuideLocalePublished(data.nanoId, data.locale)
  })
