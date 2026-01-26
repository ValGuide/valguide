import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { archiveGuide } from './archive-guide.server'

export type { ArchiveGuideResult } from './archive-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const archiveGuideSchema = z.object({
  nanoId: z.string(),
})

export const archiveGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveGuideSchema)
  .handler(async ({ context, data }) => {
    return archiveGuide(data.nanoId, context.user.id)
  })
