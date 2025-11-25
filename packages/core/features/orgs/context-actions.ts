'use server'

import { cookies } from 'next/headers'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import { isTeamMember, getTeamBySlug, getUserTeams } from './queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TEAM_COOKIE_NAME = 'active-team-slug'

export async function getSidebarDataAction() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    return null
  }

  const teams = await getUserTeams(db, user.sub)
  const activeSlug = await getActiveTeamSlug()
  
  let currentTeam = teams.find((t: any) => t.slug === activeSlug)
  
  const sidebarUser = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
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
      wasAutoSelected: true
    }
  }

  return {
    user: sidebarUser,
    teams,
    currentTeam,
    wasAutoSelected: false
  }
}

export async function switchTeamAction(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify team exists
  const team = await getTeamBySlug(db, slug)
  if (!team) {
    throw new Error('Team not found')
  }

  // Verify membership
  const isMember = await isTeamMember(db, team.id, user.sub)
  if (!isMember) {
    throw new Error('Not a member of this team')
  }

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(TEAM_COOKIE_NAME, slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  // Reload
  revalidatePath('/')
  return { success: true }
}

export async function getActiveTeamSlug() {
  const cookieStore = await cookies()
  return cookieStore.get(TEAM_COOKIE_NAME)?.value
}
