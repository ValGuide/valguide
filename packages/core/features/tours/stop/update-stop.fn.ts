import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateStop } from './update-stop.server'

export type { UpdateStopInput, UpdateStopResult } from './update-stop.server'

const updateStopSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
})

export const updateStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return updateStop(stopId, { availableLocales: data.availableLocales }, context.user.id)
  })
