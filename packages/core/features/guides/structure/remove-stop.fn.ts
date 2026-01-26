import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { removeStopFromGuide } from './remove-stop.server'

export type { RemoveStopFromGuideInput, RemoveStopFromGuideResult } from './remove-stop.server'

const removeStopFromGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
})

export const removeStopFromGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeStopFromGuideSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)

    return removeStopFromGuide(data)
  })
