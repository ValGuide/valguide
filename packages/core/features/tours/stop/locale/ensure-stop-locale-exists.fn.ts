import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { ensureStopLocaleExists } from './ensure-stop-locale-exists.server'

export type { EnsureStopLocaleResult } from './ensure-stop-locale-exists.server'

const ensureStopLocaleExistsSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const ensureStopLocaleExistsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(ensureStopLocaleExistsSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)
    return ensureStopLocaleExists(data.nanoId, data.locale)
  })
