import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listArchivedGuides } from './list-archived-guides.server'

export type { ArchivedGuideListItem } from './list-archived-guides.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const listArchivedGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return listArchivedGuides(orgId)
  })
