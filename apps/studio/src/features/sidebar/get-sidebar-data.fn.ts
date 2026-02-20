import { createServerFn } from '@tanstack/react-start'
import { getImageKitUrl } from '@valguide/core/features/assets/image-url'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams.server'
import type { OrganizationWithRole } from '@valguide/core/features/orgs/types'
import { getOrCreateProfile } from '@valguide/core/features/profiles/get-or-create-profile.server'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'

// ============================================================================
// TYPES
// ============================================================================

type SidebarTeam = Omit<OrganizationWithRole, 'logoStoragePath'> & { logo: string | null }

export interface SidebarData {
  user: {
    userId: string
    name: string
    email: string
    avatar: string
  }
  teams: SidebarTeam[]
  currentTeam: SidebarTeam | undefined
  wasAutoSelected: boolean
}

function mapTeam(team: OrganizationWithRole): SidebarTeam {
  const { logoStoragePath, ...rest } = team
  return { ...rest, logo: logoStoragePath ? getImageKitUrl(logoStoragePath) : null }
}

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getSidebarDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const activeTeamId = context.activeOrgId
    const [rawTeams, profile] = await Promise.all([getUserTeams(db, user.id), getOrCreateProfile(user.id)])

    const teams = rawTeams.map(mapTeam)
    let currentTeam = teams.find((t) => t.id === activeTeamId)

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
