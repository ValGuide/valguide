import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { addStopToGuide } from './add-stop.server'

export type { AddStopToGuideInput, AddStopToGuideResult } from './add-stop.server'

const addStopToGuideSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  position: z.number().int().min(0).optional(),
})

export const addStopToGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(addStopToGuideSchema)
  .handler(async ({ context, data }) => {
    // Verify access to both guide and stop
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    return addStopToGuide(data)
  })
