import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { type SendInviteOtpResult, sendInviteOtp } from './send-invite-otp.server'

export type { SendInviteOtpResult } from './send-invite-otp.server'

// =============================================================================
// SCHEMA
// =============================================================================

const sendInviteOtpSchema = z.object({
  token: z.string(),
})

// =============================================================================
// SERVER FUNCTION
// =============================================================================

/**
 * Send an OTP to the invited email address.
 * No auth middleware needed — user is unauthenticated.
 * Email is derived from the invite token server-side for security.
 */
export const sendInviteOtpFn = createServerFn({ method: 'POST' })
  .inputValidator(sendInviteOtpSchema)
  .handler(async ({ data }): Promise<SendInviteOtpResult> => {
    return sendInviteOtp(data.token)
  })
