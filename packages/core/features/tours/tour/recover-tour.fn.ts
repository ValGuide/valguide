import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
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
    return recoverTour(data.nanoId, context.user.id)
  })
