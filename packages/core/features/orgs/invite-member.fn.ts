import { createHash, randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { sendEmail } from '@valguide/transactional'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
import { NotFoundError, requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamById } from './get-team.fn'
import { ORG_ROLES, type OrgRole, organizationInvitation } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type InviteMemberInput = {
  teamId: string
  email: string
  role: OrgRole
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Create an invitation (or update existing one for same email)
 */
export async function createInvitation(
  dbClient: DB,
  organizationId: string,
  email: string,
  role: OrgRole,
  invitedBy: string,
  tokenHash: string,
) {
  // Check if invitation already exists
  const existing = await dbClient.query.organizationInvitation.findFirst({
    where: and(eq(organizationInvitation.organizationId, organizationId), eq(organizationInvitation.email, email)),
  })

  if (existing) {
    // Update existing invitation
    const [updated] = await dbClient
      .update(organizationInvitation)
      .set({
        role,
        invitedBy,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      })
      .where(eq(organizationInvitation.id, existing.id))
      .returning()
    return updated
  }

  // Create new invitation
  const [invite] = await dbClient
    .insert(organizationInvitation)
    .values({
      organizationId,
      email,
      role,
      invitedBy,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
    .returning()

  return invite
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const inviteMemberSchema = z.object({
  teamId: z.string(),
  email: z.string().email(),
  role: z.enum(ORG_ROLES),
})

export const inviteMemberFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(inviteMemberSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    const team = await getTeamById(db, data.teamId)
    if (!team) throw new NotFoundError('Team')

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await createInvitation(db, data.teamId, data.email, data.role as OrgRole, context.user.id, tokenHash)

    await sendEmail({
      to: data.email,
      subject: `Join ${team.name} on ValGuide`,
      template: {
        name: 'team-invite',
        data: {
          inviteLink: `${serverEnv.VITE_STUDIO_URL}/join-team?token=${token}`,
          teamName: team.name,
          inviterName: context.user.email || 'A colleague',
          logoUrl: `${serverEnv.VITE_STUDIO_URL}/icon.png`,
        },
      },
    })

    console.log(`Invite link for ${data.email}: /join-team?token=${token}`)
  })
