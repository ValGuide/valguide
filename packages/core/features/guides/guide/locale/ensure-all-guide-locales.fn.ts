import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { ensureAllGuideLocales } from './ensure-all-guide-locales.server'

export type { EnsureAllGuideLocalesResult } from './ensure-all-guide-locales.server'

const ensureAllGuideLocalesSchema = z.object({
  guideNanoId: z.string(),
})

export const ensureAllGuideLocalesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(ensureAllGuideLocalesSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)
    return ensureAllGuideLocales(data.guideNanoId)
  })
