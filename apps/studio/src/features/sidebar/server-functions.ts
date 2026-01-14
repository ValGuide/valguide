import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { getProfile } from '@valguide/core/features/profiles/queries'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'
import { getActiveTeamSlug, setActiveTeamSlug } from '@valguide/features/utils/cookies.ts'

export const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(
  handleError(async () => {
    const sidebarState = getCookie('sidebar_state')
    return sidebarState !== 'false'
  }),
)

export const getSidebarDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(
    handleError(async ({ context }) => {
      const user = context.user
      const [teams, profile] = await Promise.all([getUserTeams(db, user.id), getProfile(user.id)])

      const activeSlug = getActiveTeamSlug()

      let currentTeam = teams.find((t: any) => t.slug === activeSlug)

      const name = getUserDisplayName(profile, user.email, user.metadata)

      const sidebarUser = {
        name,
        email: user.email || '',
        avatar: user.metadata?.avatar_url || '',
      }

      if (!currentTeam && teams.length > 0) {
        currentTeam = teams[0]

        setActiveTeamSlug(currentTeam.slug)

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
    }),
  )
