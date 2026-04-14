import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireAuthMiddleware } from '../../auth/middleware'
import { recoverTour } from './recover-tour.server'

export type { RecoverTourResult } from './recover-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const recoverTourSchema = z.object({
  nanoId: z.string(),
})

export const recoverTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverTourSchema)
  .handler(async ({ context, data }) => {
    const result = await recoverTour(data.nanoId, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'tour.recovered',
      properties: {
        tour_nano_id: result.nanoId,
      },
    })
    return result
  })
