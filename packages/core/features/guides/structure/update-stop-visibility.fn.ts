import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateStopVisibility } from './update-stop-visibility.server'

export type { UpdateStopVisibilityInput, UpdateStopVisibilityResult } from './update-stop-visibility.server'

const updateStopVisibilitySchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  visible: z.boolean(),
})

export const updateStopVisibilityFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopVisibilitySchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)
    await requireStopAccessByNanoId(data.stopNanoId, context.user.id)

    return updateStopVisibility(data)
  })
