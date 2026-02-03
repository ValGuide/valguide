import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateTour } from './update-tour.server'

export type { UpdateTourInput, UpdateTourResult } from './update-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateTourSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
  addLocale: z.string().optional(),
  removeLocale: z.string().optional(),
})

export const updateTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateTourSchema)
  .handler(async ({ context, data }) => {
    return updateTour(data, context.user.id)
  })
