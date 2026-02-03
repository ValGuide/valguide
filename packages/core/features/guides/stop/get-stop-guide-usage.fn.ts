import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireStopAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getStopGuideUsage } from './get-stop-guide-usage.server'

export type { StopGuideUsageResult } from './get-stop-guide-usage.server'

const inputSchema = z.object({
  nanoId: z.string(),
})

export const getStopGuideUsageFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(inputSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccessByNanoId(data.nanoId, context.user.id)
    return getStopGuideUsage(data.nanoId)
  })
