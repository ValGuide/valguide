import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { deleteStop } from './delete-stop.server'

export type { DeleteStopResult } from './delete-stop.server'

const deleteStopSchema = z.object({
  nanoId: z.string(),
})

export const deleteStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return deleteStop(stopId, context.user.id)
  })
