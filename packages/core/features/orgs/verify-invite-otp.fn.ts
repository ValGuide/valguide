import { createServerFn } from '@tanstack/react-start'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'
import { z } from 'zod'
import { verifyInviteOtp } from './verify-invite-otp.server'

export type { VerifyInviteOtpResult } from './verify-invite-otp.server'

// =============================================================================
// SCHEMA
// =============================================================================

const verifyInviteOtpSchema = z.object({
  token: z.string(),
  otp: z.string(),
})

// =============================================================================
// SERVER FUNCTION
// =============================================================================

/**
 * Verify OTP and accept invitation atomically.
 * No auth middleware needed — user starts unauthenticated and becomes
 * authenticated during this call via supabase.auth.verifyOtp.
 */
export const verifyInviteOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(verifyInviteOtpSchema)
  .handler(async ({ data }) => {
    const result = await verifyInviteOtp(data.token, data.otp)

    if (result.success) {
      setActiveTeamId(result.organizationId)
    }

    // Don't leak organizationId to client
    if (result.success) {
      return { success: true as const }
    }
    return result
  })
