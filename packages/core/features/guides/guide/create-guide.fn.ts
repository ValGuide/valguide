import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { createGuide } from './create-guide.server'

export type { CreateGuideInput, CreateGuideResult } from './create-guide.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createGuideSchema = z.object({
  title: z.string().optional(),
  locale: z.string().optional(),
})

export const createGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createGuideSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return createGuide(data, orgId, context.user.id)
  })
