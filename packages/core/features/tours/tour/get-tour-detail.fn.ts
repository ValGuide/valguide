import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getTourDetail } from './get-tour-detail.server'

export type { LocaleDraftInfo, TourDetail } from './get-tour-detail.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getTourDetailSchema = z.object({
  nanoId: z.string(),
})

export const getTourDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTourDetailSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.nanoId, context.user.id)

    const detail = await getTourDetail(data.nanoId)
    if (!detail) {
      throw new NotFoundError('Guide')
    }

    return detail
  })
