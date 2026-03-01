import { createHash } from 'node:crypto'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { auth } from '../auth/better-auth.server'
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

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email: invite.email,
        type: 'sign-in',
      },
      headers: getRequestHeaders(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send OTP'
    return { success: false, error: message }
  }

  return { success: true }
}
