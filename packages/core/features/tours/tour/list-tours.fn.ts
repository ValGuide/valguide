import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listTours } from './list-tours.server'

export type { TourListItem, ListToursFilters } from './list-tours.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const listToursSchema = z.object({
  includeArchived: z.boolean().optional(),
  locale: z.string().optional(),
})

export const listToursFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(listToursSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return listTours(orgId, data)
  })
