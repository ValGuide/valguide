import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getGuidesByOrganizationId } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getGuidesInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuidesInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id
    const queryOrganizationId = data.organizationId

    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      return []
    }

    let targetOrganizationId: string | undefined

    if (queryOrganizationId) {
      const hasAccess = userTeams.some((t: { id: string }) => t.id === queryOrganizationId)
      if (hasAccess) {
        targetOrganizationId = queryOrganizationId
      }
    }

    if (!targetOrganizationId) {
      const activeTeamId = context.activeOrgId

      if (activeTeamId) {
        const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
        if (team) {
          targetOrganizationId = team.id
        }
      }
    }

    if (!targetOrganizationId) {
      targetOrganizationId = userTeams[0].id
    }

    const guides = await getGuidesByOrganizationId(db, targetOrganizationId as string)

    return guides
  })
