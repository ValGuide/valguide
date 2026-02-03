import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getTourByNanoId } from './get-tour.server'

export type { TourBasic } from './get-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getTourSchema = z.object({
  nanoId: z.string(),
})

export const getTourFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const found = await getTourByNanoId(data.nanoId)
    if (!found) {
      throw new NotFoundError('Tour')
    }

    return found
  })
