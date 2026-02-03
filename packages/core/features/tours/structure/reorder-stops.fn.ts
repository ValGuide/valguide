import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireTourAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { reorderStops } from './reorder-stops.server'

export type { ReorderStopsInput, ReorderStopsResult } from './reorder-stops.server'

const reorderStopsSchema = z.object({
  tourNanoId: z.string(),
  stopNanoIds: z.array(z.string()),
})

export const reorderStopsFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(reorderStopsSchema)
  .handler(async ({ context, data }) => {
    await requireTourAccessByNanoId(data.tourNanoId, context.user.id)

    return reorderStops(data)
  })
