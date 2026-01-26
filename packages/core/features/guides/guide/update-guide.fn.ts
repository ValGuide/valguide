import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../../auth/middleware'
import { updateGuide } from './update-guide.server'

export type { UpdateGuideInput, UpdateGuideResult } from './update-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateGuideSchema = z.object({
  nanoId: z.string(),
  availableLocales: z.array(z.string()).optional(),
  addLocale: z.string().optional(),
  removeLocale: z.string().optional(),
})

export const updateGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideSchema)
  .handler(async ({ context, data }) => {
    return updateGuide(data, context.user.id)
  })
