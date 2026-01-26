import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { reorderStops } from './reorder-stops.server'

export type { ReorderStopsInput, ReorderStopsResult } from './reorder-stops.server'

const reorderStopsSchema = z.object({
  guideNanoId: z.string(),
  stopNanoIds: z.array(z.string()),
})

export const reorderStopsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderStopsSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.guideNanoId, context.user.id)

    return reorderStops(data)
  })
