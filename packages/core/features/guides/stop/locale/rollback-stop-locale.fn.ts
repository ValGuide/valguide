import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { rollbackStopLocale } from './rollback-stop-locale.server'

export type { RollbackStopLocaleResult } from './rollback-stop-locale.server'

const rollbackStopLocaleSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
  targetVersionId: z.string(),
})

export const rollbackStopLocaleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(rollbackStopLocaleSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return rollbackStopLocale(data.nanoId, data.locale, data.targetVersionId)
  })
