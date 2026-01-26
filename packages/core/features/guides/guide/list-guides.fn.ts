import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { listGuides } from './list-guides.server'

export type { GuideListItem, ListGuidesFilters } from './list-guides.server'

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const listGuidesSchema = z.object({
  includeArchived: z.boolean().optional(),
  locale: z.string().optional(),
})

export const listGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(listGuidesSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return listGuides(orgId, data)
  })
