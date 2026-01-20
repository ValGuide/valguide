import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getStopsByOrganizationId } from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

const getStopsInputSchema = z.object({
  organizationId: z.string().optional(),
})

export const getStopsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getStopsInputSchema)
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
        const team = userTeams.find((t: { id: string; slug: string }) => t.id === activeTeamId)
        if (team) {
          targetOrganizationId = team.id
        }
      }
    }

    if (!targetOrganizationId) {
      targetOrganizationId = userTeams[0].id
    }

    const stops = await getStopsByOrganizationId(targetOrganizationId as string)

    return stops
  })
