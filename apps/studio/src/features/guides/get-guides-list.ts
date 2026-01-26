import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getGuidesListByOrganizationId } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { z } from 'zod'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getGuidesListInputSchema = z.object({
  preferredLocale: z.string().default('de'),
})

export const getGuidesListFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getGuidesListInputSchema)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      return []
    }

    let targetOrganizationId: string | undefined

    const activeTeamId = context.activeOrgId
    if (activeTeamId) {
      const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
      if (team) {
        targetOrganizationId = team.id
      }
    }

    if (!targetOrganizationId) {
      targetOrganizationId = userTeams[0].id
    }

    return getGuidesListByOrganizationId(db, targetOrganizationId as string, data.preferredLocale)
  })
