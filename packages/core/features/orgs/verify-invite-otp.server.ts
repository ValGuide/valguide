import { createHash } from 'node:crypto'
import { db } from '@valguide/core/features/db'
import { createClient } from '@valguide/supabase/server'
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

  const supabase = await createClient()
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email: invite.email,
    token: otp,
    type: 'email',
  })

  if (verifyError) {
    return { success: false, error: verifyError.message }
  }

  const userId = verifyData.user?.id
  if (!userId) {
    return { success: false, error: 'Verification failed' }
  }

  await acceptInvitation(db, invite.id, userId)

  return { success: true, organizationId: invite.organizationId }
}
