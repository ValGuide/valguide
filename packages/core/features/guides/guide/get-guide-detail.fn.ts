import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getGuideDetail } from './get-guide-detail.server'

export type { GuideDetail, LocaleDraftInfo } from './get-guide-detail.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getGuideDetailSchema = z.object({
  nanoId: z.string(),
})

export const getGuideDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideDetailSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const detail = await getGuideDetail(data.nanoId)
    if (!detail) {
      throw new NotFoundError('Guide')
    }

    return detail
  })
