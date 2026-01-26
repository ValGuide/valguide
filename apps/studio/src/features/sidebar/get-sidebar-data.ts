import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams'
import type { Organization as Team } from '@valguide/core/features/orgs/types'
import { getProfile } from '@valguide/core/features/profiles/get-profile'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarData {
  user: {
    userId: string
    name: string
    email: string
    avatar: string
  }
  teams: Team[]
  currentTeam: Team | undefined
  wasAutoSelected: boolean
}

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getSidebarDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const activeTeamId = context.activeOrgId
    const [teams, profile] = await Promise.all([getUserTeams(db, user.id), getProfile(user.id)])

    let currentTeam = teams.find((t: any) => t.id === activeTeamId)

    const name = getUserDisplayName(profile, user.email, user.metadata)

    const sidebarUser = {
      userId: user.id,
      name,
      email: user.email || '',
      avatar: user.metadata?.avatar_url || '',
    }

    if (!currentTeam && teams.length > 0) {
      currentTeam = teams[0]

      setActiveTeamId(currentTeam.id)

      return {
        user: sidebarUser,
        teams,
        currentTeam,
        wasAutoSelected: true,
      }
    }

    return {
      user: sidebarUser,
      teams,
      currentTeam,
      wasAutoSelected: false,
    }
  })
