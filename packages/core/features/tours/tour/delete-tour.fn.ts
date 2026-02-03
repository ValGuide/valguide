import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { deleteTour, permanentlyDeleteTour } from './delete-tour.server'

export type { DeleteTourResult } from './delete-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const deleteTourSchema = z.object({
  nanoId: z.string(),
  permanent: z.boolean().optional(),
})

export const deleteTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteTourSchema)
  .handler(async ({ context, data }) => {
    if (data.permanent) {
      await permanentlyDeleteTour(data.nanoId, context.user.id)
      return { nanoId: data.nanoId, deletedAt: new Date() }
    }
    return deleteTour(data.nanoId, context.user.id)
  })
