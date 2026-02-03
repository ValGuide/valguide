import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listArchivedTours } from './list-archived-tours.server'

export type { ArchivedTourListItem } from './list-archived-tours.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const listArchivedToursFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return listArchivedTours(orgId)
  })
