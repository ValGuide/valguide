import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { and, asc, eq, gt, isNull, or, sql } from 'drizzle-orm'
import { requireAuthMiddleware } from '../auth/middleware'
import { authUsers } from '../auth/schema'
import { profiles } from '../profiles/schema'
import { getUserDisplayName } from '../profiles/utils'
import { invitation, organization } from './schema'

export type CurrentUserInvitation = {
  id: string
  organizationId: string
  organizationName: string
  organizationNanoId: string
  email: string
  role: string
  invitedBy: {
    name: string
    email: string
  }
  invitedAt: string
  expiresAt: string | null
}

export const listCurrentUserInvitationsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }): Promise<CurrentUserInvitation[]> => {
    const email = context.user.email?.trim().toLowerCase()

    if (!email) {
      return []
    }

    const rows = await db
      .select({
        invite: invitation,
        org: organization,
        inviter: authUsers,
        inviterProfile: profiles,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .leftJoin(authUsers, eq(invitation.inviterId, authUsers.id))
      .leftJoin(profiles, eq(invitation.inviterId, profiles.id))
      .where(
        and(
          eq(sql`lower(${invitation.email})`, email),
          eq(invitation.status, 'pending'),
          or(isNull(invitation.expiresAt), gt(invitation.expiresAt, new Date())),
        ),
      )
      .orderBy(asc(invitation.createdAt), asc(invitation.id))

    return rows.map(({ invite, org, inviter, inviterProfile }) => ({
      id: invite.id,
      organizationId: invite.organizationId,
      organizationName: org.name,
      organizationNanoId: org.nanoId,
      email: invite.email,
      role: invite.role,
      invitedBy: {
        name: getUserDisplayName(inviterProfile, inviter?.email),
        email: inviter?.email ?? '',
      },
      invitedAt: invite.createdAt.toISOString(),
      expiresAt: invite.expiresAt?.toISOString() ?? null,
    }))
  })
