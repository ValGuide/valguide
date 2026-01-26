import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { deleteGuide, permanentlyDeleteGuide } from './delete-guide.server'

export type { DeleteGuideResult } from './delete-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const deleteGuideSchema = z.object({
  nanoId: z.string(),
  permanent: z.boolean().optional(),
})

export const deleteGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(deleteGuideSchema)
  .handler(async ({ context, data }) => {
    if (data.permanent) {
      await permanentlyDeleteGuide(data.nanoId, context.user.id)
      return { nanoId: data.nanoId, deletedAt: new Date() }
    }
    return deleteGuide(data.nanoId, context.user.id)
  })
