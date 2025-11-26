'use server'

import { cookies } from 'next/headers'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import { isTeamMember, getTeamBySlug } from './queries'
import { revalidatePath } from 'next/cache'
import { getSidebarData, TEAM_COOKIE_NAME, getActiveTeamSlug as getActiveTeamSlugInternal } from './sidebar-data'

export async function getSidebarDataAction() {
  return getSidebarData()
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
  return getActiveTeamSlugInternal()
}
