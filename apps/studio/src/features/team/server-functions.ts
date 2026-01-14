import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import type { TeamMember } from '@valguide/core/features/orgs/components/members-table'
import type { PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'
import { getPendingInvitations, getTeamById, getTeamMembers, getUserRole } from '@valguide/core/features/orgs/queries'
import type { OrgRole, organization } from '@valguide/core/features/orgs/schema'
import { getUserDisplayName } from '@valguide/core/features/profiles/utils'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { requireAuthMiddleware } from '@valguide/features/auth/middleware'

export interface TeamData {
  team: typeof organization.$inferSelect
  members: TeamMember[]
  pendingInvites: PendingInvitation[]
  currentUserRole: OrgRole
  currentUserId: string
}

export const getTeamDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(
    handleError(async ({ context }) => {
      const user = context.user
      const orgId = context.activeOrgId

      if (!orgId) {
        return null
      }

      const team = await getTeamById(db, orgId)

      if (!team) {
        return null
      }

      const currentUserRole = await getUserRole(db, team.id, user.id)

      if (!currentUserRole) {
        return null
      }

      const membersData = await getTeamMembers(db, team.id)
      const pendingInvitesData = await getPendingInvitations(db, team.id)

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
          name: getUserDisplayName(inviterProfile, inviter?.email),
          email: inviter?.email || '',
        },
        invitedAt: invitation.createdAt.toISOString(),
        expiresAt: invitation.expiresAt.toISOString(),
      }))

      return {
        team,
        members,
        pendingInvites,
        currentUserRole: currentUserRole as OrgRole,
        currentUserId: user.id,
      }
    }),
  )
