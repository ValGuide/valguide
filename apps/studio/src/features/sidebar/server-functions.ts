import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { getProfile } from '@valguide/core/features/profiles/queries'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { createClient } from '@valguide/supabase/server'
import { getActiveTeamSlug, setActiveTeamSlug } from '@valguide/features/utils/cookies.ts'

export const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(() => {
  const sidebarState = getCookie('sidebar_state')
  return sidebarState !== 'false'
})

export const getSidebarDataFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  const [teams, profile] = await Promise.all([getUserTeams(db, user.sub), getProfile(user.sub)])

  const activeSlug = getActiveTeamSlug()

  let currentTeam = teams.find((t: any) => t.slug === activeSlug)

  const name = getUserDisplayName(profile, user.email, user.user_metadata)

  const sidebarUser = {
    name,
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '',
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
})
