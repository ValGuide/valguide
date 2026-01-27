import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { getOrCreateStopLocaleDraftForGuide } from './get-or-create-stop-locale-draft-for-guide.server'

export type { StopLocaleDraftResult } from './get-stop-locale-draft.server'

const getOrCreateStopLocaleDraftForGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  locale: z.string(),
})

export const getOrCreateStopLocaleDraftForGuideFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getOrCreateStopLocaleDraftForGuideSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    const draft = await getOrCreateStopLocaleDraftForGuide(data.guideNanoId, data.stopNanoId, data.locale)
    if (!draft) {
      throw new NotFoundError('Stop locale')
    }

    return draft
  })
