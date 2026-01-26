import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStopDetail } from './get-stop-detail.server'

export type { StopDetail, StopLocaleDraftInfo } from './get-stop-detail.server'

const getStopDetailSchema = z.object({
  nanoId: z.string(),
})

export const getStopDetailFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopDetailSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const detail = await getStopDetail(data.nanoId)
    if (!detail) {
      throw new NotFoundError('Stop')
    }

    return detail
  })
