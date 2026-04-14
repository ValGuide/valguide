import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
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

    const result = await recoverStop(stopId, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.recovered',
      properties: {
        stop_nano_id: result.nanoId,
      },
    })
    return result
  })
