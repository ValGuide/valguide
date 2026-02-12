import { createHash } from 'node:crypto'
import { db } from '@valguide/core/features/db'
import { createClient } from '@valguide/supabase/server'
import { getInvitationByTokenHash } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type SendInviteOtpResult =
  | { success: true }
  | {
      success: false
      error: string
    }

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Send an OTP to the invited email address.
 * The email is derived server-side from the invite token — never from the client.
 */
export async function sendInviteOtp(token: string): Promise<SendInviteOtpResult> {
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
  const { error } = await supabase.auth.signInWithOtp({
    email: invite.email,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
