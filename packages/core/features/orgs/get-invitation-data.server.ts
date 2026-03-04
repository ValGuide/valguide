import { getAuthSession } from '../auth/better-auth.server'
import { db } from '../db'
import { getInvitationById } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type InvitationData = {
  variant: 'invalid' | 'accepted' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getInvitationData(invitationId: string | undefined): Promise<InvitationData> {
  if (!invitationId) {
    return { variant: 'invalid' }
  }

  const invite = await getInvitationById(db, invitationId)

  if (!invite) {
    return { variant: 'invalid' }
  }

  if (invite.status === 'accepted') {
    return {
      variant: 'accepted',
      invite: {
        organization: { name: invite.organization.name },
        email: invite.email,
      },
    }
  }

  const inviteExpired = invite.expiresAt ? invite.expiresAt.getTime() < Date.now() : false
  if (invite.status !== 'pending' || inviteExpired) {
    return { variant: 'invalid' }
  }

  const session = await getAuthSession()
  const user = session?.user

  if (!user) {
    return {
      variant: 'public',
      invite: {
        organization: { name: invite.organization.name },
        email: invite.email,
      },
    }
  }

  const userEmail = user.email ?? ''
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return {
      variant: 'wrong-account',
      invite: {
        organization: { name: invite.organization.name },
        email: invite.email,
      },
      userEmail,
    }
  }

  return {
    variant: 'joining',
    invite: {
      organization: { name: invite.organization.name },
      email: invite.email,
    },
  }
}
