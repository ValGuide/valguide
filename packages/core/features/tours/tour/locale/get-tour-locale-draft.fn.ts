import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireTourAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getTourLocaleDraft } from './get-tour-locale-draft.server'

export type { TourLocaleDraftResult } from './get-tour-locale-draft.server'

const getTourLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getTourLocaleDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const draft = await getTourLocaleDraft(data.nanoId, data.locale)
    if (!draft) {
      throw new NotFoundError('Tour locale')
    }

    return draft
  })
