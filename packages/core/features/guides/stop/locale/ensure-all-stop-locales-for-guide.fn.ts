import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../../auth/authorization'
import { requireAuthMiddleware } from '../../../auth/middleware'
import { ensureAllStopLocalesForGuide } from './ensure-all-stop-locales-for-guide.server'

export type { EnsureAllStopLocalesResult } from './ensure-all-stop-locales-for-guide.server'

const ensureAllStopLocalesForGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
})

export const ensureAllStopLocalesForGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(ensureAllStopLocalesForGuideSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)
    return ensureAllStopLocalesForGuide(data.guideNanoId, data.stopNanoId)
  })
