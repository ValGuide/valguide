import { db } from '@valguide/core/features/db'
import { getPendingInvitations, getTeamBySlug, getTeamMembers, getUserRole } from '@valguide/core/features/orgs/queries'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { createClient } from '@valguide/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request) {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    const user = data?.claims

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active team slug from cookie
    const cookieStore = await cookies()
    const teamSlug = cookieStore.get('active-team-slug')?.value

    if (!teamSlug) {
      // Return null to indicate no active team (but authenticated)
      return NextResponse.json(null)
    }

    const team = await getTeamBySlug(db, teamSlug)

    if (!team) {
      // Team slug in cookie might be invalid or team deleted
      return NextResponse.json(null)
    }

    // Verify membership and get role
    const currentUserRole = await getUserRole(db, team.id, user.sub)

    if (!currentUserRole) {
      // User is not a member of this team
      return NextResponse.json(null)
    }

    const membersData = await getTeamMembers(db, team.id)
    const pendingInvitesData = await getPendingInvitations(db, team.id)

    // Transform data for client component
    const members = membersData.map(({ member, profile, user: authUser }) => ({
      id: member.id,
      userId: member.userId,
      email: authUser?.email || '',
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      role: member.role as OrgRole,
      joinedAt: member.createdAt.toISOString(),
      isOwner: member.isOwner || false,
    }))

    const pendingInvites = pendingInvitesData.map(({ invitation, inviter, inviterProfile }) => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role as OrgRole,
      invitedBy: {
        name: getUserDisplayName(
          inviterProfile,
          inviter?.email,
          inviter?.raw_user_meta_data || inviter?.rawUserMetaData,
        ),
        email: inviter?.email || '',
      },
      invitedAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
    }))

    return NextResponse.json({
      team,
      members,
      pendingInvites,
      currentUserRole: currentUserRole as OrgRole,
      currentUserId: user.sub,
    })
  } catch (error) {
    console.error('Failed to fetch team data:', error)
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 })
  }
}
