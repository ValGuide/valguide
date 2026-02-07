import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { discardAllTourChanges } from './discard-all-tour-changes.server'

const discardAllTourChangesSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const discardAllTourChangesFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardAllTourChangesSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    return discardAllTourChanges(data.nanoId, data.locale)
  })
