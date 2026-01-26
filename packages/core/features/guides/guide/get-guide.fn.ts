import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { NotFoundError, requireGuideAccessByNanoId } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { getGuideByNanoId } from './get-guide.server'

export type { GuideBasic } from './get-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getGuideSchema = z.object({
  nanoId: z.string(),
})

export const getGuideFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuideSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccessByNanoId(data.nanoId, context.user.id)

    const found = await getGuideByNanoId(data.nanoId)
    if (!found) {
      throw new NotFoundError('Guide')
    }

    return found
  })
