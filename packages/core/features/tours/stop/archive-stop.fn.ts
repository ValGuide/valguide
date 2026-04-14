import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../../posthog/server'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { archiveStop } from './archive-stop.server'

export type { ArchiveStopResult } from './archive-stop.server'

const archiveStopSchema = z.object({
  nanoId: z.string(),
})

export const archiveStopFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveStopSchema)
  .handler(async ({ context, data }) => {
    const { stopId } = await requireStopAccessByNanoId(data.nanoId, context.user.id)

    const result = await archiveStop(stopId, context.user.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'stop.archived',
      properties: {
        stop_nano_id: result.nanoId,
      },
    })
    return result
  })
