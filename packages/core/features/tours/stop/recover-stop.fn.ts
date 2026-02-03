import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { recoverStop } from './recover-stop.server'

export type { RecoverStopResult } from './recover-stop.server'

const recoverStopSchema = z.object({
  nanoId: z.string(),
})

export const recoverStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    return recoverStop(stopId, context.user.id)
  })
