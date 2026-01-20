import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { getProfile } from '@valguide/core/features/profiles/queries'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'

export const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const sidebarState = getCookie('sidebar_state')
  return sidebarState !== 'false'
})

export const getSidebarDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const activeTeamId = context.activeOrgId
    const [teams, profile] = await Promise.all([getUserTeams(db, user.id), getProfile(user.id)])

    let currentTeam = teams.find((t: any) => t.id === activeTeamId)

    const name = getUserDisplayName(profile, user.email, user.metadata)

    const sidebarUser = {
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
