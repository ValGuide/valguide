import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
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

    return archiveStop(stopId, context.user.id)
  })
