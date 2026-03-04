import { createServerFn } from '@tanstack/react-start'
import { getImageKitUrl } from '@valguide/core/features/assets/image-url'
import { setActiveOrganizationForCurrentSession } from '@valguide/core/features/auth/better-auth.server'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams.server'
import type { OrganizationWithRole } from '@valguide/core/features/orgs/types'
import { getOrCreateProfile } from '@valguide/core/features/profiles/get-or-create-profile.server'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'

// ============================================================================
// TYPES
// ============================================================================

type SidebarTeam = Omit<OrganizationWithRole, 'logoStoragePath'> & { logo: string | null }
type UserMetadata = {
  full_name?: string
  avatar_url?: string
}

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

    const userMetadata: UserMetadata | null =
      user.metadata && typeof user.metadata === 'object' ? (user.metadata as UserMetadata) : null

    const teams = rawTeams.map(mapTeam)
    let currentTeam = teams.find((t) => t.id === activeTeamId)

    const name = getUserDisplayName(profile, user.email, userMetadata)

    const sidebarUser = {
      userId: user.id,
      name,
      email: user.email || '',
      avatar: userMetadata?.avatar_url || '',
    }

    if (!currentTeam && teams.length > 0) {
      currentTeam = teams[0]

      await setActiveOrganizationForCurrentSession(currentTeam.id)

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
