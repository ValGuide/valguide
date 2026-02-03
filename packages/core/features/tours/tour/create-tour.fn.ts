import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { createTour } from './create-tour.server'

export type { CreateTourInput, CreateTourResult } from './create-tour.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createTourSchema = z.object({
  title: z.string().optional(),
  locale: z.string().optional(),
})

export const createTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTourSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return createTour(data, orgId, context.user.id)
  })
