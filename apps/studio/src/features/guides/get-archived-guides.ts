import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getArchivedGuidesWithCover } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getArchivedGuidesFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      return { guides: [], userId }
    }

    const activeTeamId = context.activeOrgId
    let targetOrganizationId = userTeams[0].id

    if (activeTeamId) {
      const team = userTeams.find((t: { id: string }) => t.id === activeTeamId)
      if (team) {
        targetOrganizationId = team.id
      }
    }

    const guides = await getArchivedGuidesWithCover(db, targetOrganizationId)

    return {
      guides,
      userId,
    }
  })
