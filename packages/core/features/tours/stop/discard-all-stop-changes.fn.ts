import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { discardAllStopChanges } from './discard-all-stop-changes.server'

const discardAllStopChangesSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const discardAllStopChangesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardAllStopChangesSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return discardAllStopChanges(data.nanoId, data.locale)
  })
