import { createServerFn } from '@tanstack/react-start'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getTeamBySlug, isTeamMember } from './queries'
import { TEAM_COOKIE_NAME } from './sidebar-data'

const switchTeamSchema = z.object({
  slug: z.string(),
})

export const switchTeamFn = createServerFn({ method: 'POST' })
  .inputValidator(switchTeamSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims

    if (!user) {
      throw new Error('Unauthorized')
    }

    const team = await getTeamBySlug(db, data.slug)
    if (!team) {
      throw new Error('Team not found')
    }

    const isMember = await isTeamMember(db, team.id, user.sub)
    if (!isMember) {
      throw new Error('Not a member of this team')
    }

    const cookieStore = await cookies()
    cookieStore.set(TEAM_COOKIE_NAME, data.slug, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })

    return { success: true }
  })
