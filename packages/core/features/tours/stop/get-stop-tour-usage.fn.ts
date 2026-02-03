import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStopTourUsage } from './get-stop-tour-usage.server'

export type { StopTourUsageResult } from './get-stop-tour-usage.server'

const inputSchema = z.object({
  nanoId: z.string(),
})

export const getStopTourUsageFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(inputSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)
    return getStopTourUsage(data.nanoId)
  })
