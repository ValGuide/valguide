import { createHash } from 'node:crypto'
import { createClient } from '../../supabase/server'
import { db } from '../db'
import { getInvitationByTokenHash } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type InvitationData = {
  variant: 'invalid' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  nextUrl?: string
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

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const user = claimsData?.claims

  const nextUrl = `/join-team?token=${token}`

  if (!user) {
    return {
      variant: 'public',
      invite: {
        organization: { name: invite.organization.name },
        email: invite.email,
      },
      nextUrl,
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
