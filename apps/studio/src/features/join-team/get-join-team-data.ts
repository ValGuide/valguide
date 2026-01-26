import { createHash } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getInvitationByTokenHash } from '@valguide/core/features/orgs/utils'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'

// ============================================================================
// TYPES
// ============================================================================

export type JoinTeamData = {
  variant: 'invalid' | 'public' | 'wrong-account' | 'joining'
  invite?: {
    organization: { name: string }
    email: string
  }
  userEmail?: string
  nextUrl?: string
}

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const getJoinTeamDataSchema = z.object({
  token: z.string().optional(),
})

export const getJoinTeamDataFn = createServerFn({ method: 'GET' })
  .inputValidator(getJoinTeamDataSchema)
  .handler(async ({ data }): Promise<JoinTeamData> => {
    const { token } = data

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
  })
