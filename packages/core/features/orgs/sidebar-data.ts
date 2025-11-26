import { cookies } from 'next/headers'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getUserTeams } from './queries'
import { getProfile } from '../profiles/queries'
import { getUserDisplayName } from '../profiles/utils'

export const TEAM_COOKIE_NAME = 'active-team-slug'

export async function getActiveTeamSlug() {
  const cookieStore = await cookies()
  return cookieStore.get(TEAM_COOKIE_NAME)?.value
}

export async function getSidebarData() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return null
  }

  const [teams, profile] = await Promise.all([getUserTeams(db, user.sub), getProfile(user.sub)])

  const activeSlug = await getActiveTeamSlug()

  let currentTeam = teams.find((t: any) => t.slug === activeSlug)

  const name = getUserDisplayName(profile, user.email, user.user_metadata)

  const sidebarUser = {
    name,
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '',
  }

  if (!currentTeam && teams.length > 0) {
    currentTeam = teams[0]

    const cookieStore = await cookies()
    cookieStore.set(TEAM_COOKIE_NAME, currentTeam.slug, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    // Flag that we auto-selected so client can refresh if needed
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
}
