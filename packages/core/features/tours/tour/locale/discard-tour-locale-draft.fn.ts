import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { discardTourLocaleDraft } from './discard-tour-locale-draft.server'

const discardTourLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const discardTourLocaleDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardTourLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    return discardTourLocaleDraft(data.nanoId, data.locale)
  })
