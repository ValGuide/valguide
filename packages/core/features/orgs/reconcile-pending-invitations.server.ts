import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, eq } from 'drizzle-orm'
import { logPerformance, timePerformance } from '../../utils/performance'
import { getOrgMembership } from '../auth/authorization'
import { auth, setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { db } from '../db'
import { resolvePreferredActiveOrganizationId } from './resolve-preferred-active-organization-id'
import { invitation } from './schema'
import { getPendingInvitationsByEmail } from './utils'

export type ReconcilePendingInvitationsResult = {
  acceptedInvitationIds: string[]
  acceptedOrganizationIds: string[]
  activeOrganizationId: string | null
}

export async function reconcilePendingInvitationsForUser(
  userId: string,
  email: string | undefined,
): Promise<ReconcilePendingInvitationsResult> {
  if (!email) {
    return {
      acceptedInvitationIds: [],
      acceptedOrganizationIds: [],
      activeOrganizationId: null,
    }
  }

  const pendingInvites = await timePerformance(
    'auth.reconcilePendingInvitations.lookup',
    async () => getPendingInvitationsByEmail(db, email),
    { userId },
  )

  if (pendingInvites.length === 0) {
    return {
      acceptedInvitationIds: [],
      acceptedOrganizationIds: [],
      activeOrganizationId: null,
    }
  }

  const headers = getRequestHeaders()
  const acceptedInvitationIds: string[] = []
  const acceptedOrganizationIds = new Set<string>()
  const preferredActiveOrganizationId = pendingInvites[0]?.organizationId ?? null

  for (const pendingInvite of pendingInvites) {
    const existingMembership = await timePerformance(
      'auth.reconcilePendingInvitations.membershipLookup',
      async () => getOrgMembership(userId, pendingInvite.organizationId),
      {
        userId,
        invitationId: pendingInvite.id,
        organizationId: pendingInvite.organizationId,
      },
    )

    if (existingMembership) {
      await db
        .update(invitation)
        .set({ status: 'accepted' })
        .where(and(eq(invitation.id, pendingInvite.id), eq(invitation.status, 'pending')))

      acceptedInvitationIds.push(pendingInvite.id)
      acceptedOrganizationIds.add(pendingInvite.organizationId)
      continue
    }

    try {
      await timePerformance(
        'auth.reconcilePendingInvitations.accept',
        async () =>
          auth.api.acceptInvitation({
            headers,
            body: {
              invitationId: pendingInvite.id,
            },
          }),
        {
          userId,
          invitationId: pendingInvite.id,
          organizationId: pendingInvite.organizationId,
        },
      )

      acceptedInvitationIds.push(pendingInvite.id)
      acceptedOrganizationIds.add(pendingInvite.organizationId)
    } catch (error) {
      const membershipAfterError = await getOrgMembership(userId, pendingInvite.organizationId)
      if (membershipAfterError) {
        await db
          .update(invitation)
          .set({ status: 'accepted' })
          .where(and(eq(invitation.id, pendingInvite.id), eq(invitation.status, 'pending')))

        acceptedInvitationIds.push(pendingInvite.id)
        acceptedOrganizationIds.add(pendingInvite.organizationId)
        continue
      }

      logPerformance('auth.reconcilePendingInvitations.acceptFailed', {
        userId,
        invitationId: pendingInvite.id,
        organizationId: pendingInvite.organizationId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const activeOrganizationId = resolvePreferredActiveOrganizationId(
    preferredActiveOrganizationId,
    acceptedOrganizationIds,
  )

  if (activeOrganizationId) {
    await setActiveOrganizationForCurrentSession(activeOrganizationId)
  }

  return {
    acceptedInvitationIds,
    acceptedOrganizationIds: [...acceptedOrganizationIds],
    activeOrganizationId,
  }
}
