import { createHash } from 'node:crypto'
import { getAuthSession } from '../auth/better-auth.server'
import { db } from '../db'
import { getInvitationByTokenHash } from './utils'

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

export async function getInvitationData(token: string | undefined): Promise<InvitationData> {
  if (!token) {
    return { variant: 'invalid' }
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  if (!invite) {
    return { variant: 'invalid' }
  }

  if (invite.acceptedAt) {
    return {
      variant: 'accepted',
      invite: {
        organization: { name: invite.organization.name },
        email: invite.email,
      },
    }
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
