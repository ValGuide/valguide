import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getStopLocaleDraft } from './get-stop-locale-draft.server'

export type { StopLocaleDraftResult } from './get-stop-locale-draft.server'

const getStopLocaleDraftSchema = z.object({
  nanoId: z.string(),
  locale: z.string(),
})

export const getStopLocaleDraftFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopLocaleDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const draft = await getStopLocaleDraft(data.nanoId, data.locale)
    if (!draft) {
      throw new NotFoundError('Stop locale')
    }

    return draft
  })
