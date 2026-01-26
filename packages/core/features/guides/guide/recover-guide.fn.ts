import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { recoverGuide } from './recover-guide.server'

export type { RecoverGuideResult } from './recover-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const recoverGuideSchema = z.object({
  nanoId: z.string(),
})

export const recoverGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(recoverGuideSchema)
  .handler(async ({ context, data }) => {
    return recoverGuide(data.nanoId, context.user.id)
  })
