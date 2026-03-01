import { createHash } from 'node:crypto'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { auth } from '../auth/better-auth.server'
import { authUsers } from '../auth/schema'
import { acceptInvitation } from './join-team.server'
import { getInvitationByTokenHash } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type VerifyInviteOtpResult = { success: true; organizationId: string } | { success: false; error: string }

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Verify OTP and accept invitation atomically.
 * The email is derived from the invite token server-side.
 * Returns organizationId on success so the caller can set the active team cookie.
 */
export async function verifyInviteOtp(token: string, otp: string): Promise<VerifyInviteOtpResult> {
  const tokenHash = createHash('sha256').update(token).digest('hex')
  const invite = await getInvitationByTokenHash(db, tokenHash)

  if (!invite) {
    return { success: false, error: 'Invitation not found or expired' }
  }

  if (invite.acceptedAt) {
    return {
      success: false,
      error: 'Invitation has already been accepted',
    }
  }

  try {
    await auth.api.signInEmailOTP({
      body: {
        email: invite.email,
        otp,
      },
      headers: getRequestHeaders(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    return { success: false, error: message }
  }

  const [user] = await db.select({ id: authUsers.id }).from(authUsers).where(eq(authUsers.email, invite.email)).limit(1)

  const userId = user?.id
  if (!userId) {
    return { success: false, error: 'Verification failed' }
  }

  await acceptInvitation(db, invite.id, userId)

  return { success: true, organizationId: invite.organizationId }
}
