import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { getOrganizationGuideAnalytics } from './get-guide-analytics.server'

export type { GuideAnalyticsSummary } from './get-guide-analytics.server'

export const getGuideAnalyticsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const organizationId = context.activeOrgId

    if (!organizationId) {
      throw new Error('No active organization selected')
    }

    await requireOrgMember(organizationId, context.user.id)

    return getOrganizationGuideAnalytics(organizationId)
  })
