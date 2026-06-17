import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { captureStudioProductEvent } from '../../posthog/server'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { auth, setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { db } from '../db'
import { invitation } from './schema'
import { getPendingInvitationById, isTeamMember } from './utils'

export type AcceptInvitationInput = {
  invitationId: string
  userId: string
  userEmail?: string
  switchToOrganization?: boolean
}

export type AcceptInvitationResult = {
  success: true
  organizationId: string
  organizationName: string
}

export async function acceptInvitationForUser({
  invitationId,
  userId,
  userEmail,
  switchToOrganization = false,
}: AcceptInvitationInput): Promise<AcceptInvitationResult> {
  const invite = await getPendingInvitationById(db, invitationId)

  if (!invite) {
    throw new NotFoundError('Invitation')
  }

  if (invite.email.toLowerCase() !== (userEmail || '').toLowerCase()) {
    throw new ForbiddenError('This invitation was sent to a different email address')
  }

  const isMember = await isTeamMember(db, invite.organizationId, userId)
  if (isMember) {
    await db
      .update(invitation)
      .set({ status: 'accepted' })
      .where(and(eq(invitation.id, invite.id), eq(invitation.status, 'pending')))
  } else {
    await auth.api.acceptInvitation({
      headers: getRequestHeaders(),
      body: {
        invitationId: invite.id,
      },
    })
  }

  if (switchToOrganization) {
    await setActiveOrganizationForCurrentSession(invite.organizationId)
  }

  captureStudioProductEvent({
    distinctId: userId,
    event: 'org.joined',
    organizationNanoId: invite.organization.nanoId,
    properties: {
      organization_slug: invite.organization.slug,
      switched_workspace: switchToOrganization,
    },
  })

  return {
    success: true,
    organizationId: invite.organizationId,
    organizationName: invite.organization.name,
  }
}
