import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { rollbackGuideLocale } from './rollback-guide-locale.server'

export type { RollbackGuideLocaleResult } from './rollback-guide-locale.server'

const rollbackGuideLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  targetVersionId: z.string(),
})

export const rollbackGuideLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackGuideLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    return rollbackGuideLocale(data.nanoId, data.locale, data.targetVersionId)
  })
