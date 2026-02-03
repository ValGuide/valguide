import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { archiveTour } from './archive-tour.server'

export type { ArchiveTourResult } from './archive-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const archiveTourSchema = z.object({
  nanoId: z.string(),
})

export const archiveTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(archiveTourSchema)
  .handler(async ({ context, data }) => {
    return archiveTour(data.nanoId, context.user.id)
  })
