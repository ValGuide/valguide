import { createHash, randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { setActiveTeamId, setActiveTeamSlug } from '@valguide/features/utils/cookies.ts'
import { sendEmail } from '@valguide/transactional'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import {
  acceptInvitation,
  createInvitation,
  createTeam,
  deleteInvitation,
  ensureDefaultTeam,
  removeMember,
  updateMemberRole,
} from './mutations'
import { getInvitationById, getInvitationByTokenHash, getTeamById, getTeamBySlug, isTeamMember } from './queries'
import { ORG_ROLES, type OrgRole } from './schema'

const createTeamSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
})

export const createTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTeamSchema)
  .handler(async ({ context, data }) => {
    const team = await createTeam(db, data.name, context.user.id, data.slug)
    setActiveTeamSlug(team.slug)
    setActiveTeamId(team.id)
    return team
  })

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
    if (!team) throw new Error('Team not found')

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

const resendInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const resendInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(resendInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    const invite = await getInvitationById(db, data.inviteId)
    if (!invite) throw new Error('Invitation not found')

    const team = await getTeamById(db, data.teamId)
    if (!team) throw new Error('Team not found')

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await createInvitation(db, data.teamId, invite.email, invite.role as OrgRole, context.user.id, tokenHash)

    await sendEmail({
      to: invite.email,
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

    console.log(`Resend invite link for ${invite.email}: /join-team?token=${token}`)
  })

const cancelInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const cancelInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(cancelInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await deleteInvitation(db, data.inviteId)
  })

const removeMemberSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
})

export const removeMemberFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeMemberSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await removeMember(db, data.memberId)
  })

const updateMemberRoleSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
  newRole: z.enum(ORG_ROLES),
})

export const updateMemberRoleFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateMemberRoleSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await updateMemberRole(db, data.memberId, data.newRole as OrgRole)
  })

const joinTeamSchema = z.object({
  token: z.string(),
})

export const joinTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(joinTeamSchema)
  .handler(async ({ context, data }) => {
    const tokenHash = createHash('sha256').update(data.token).digest('hex')
    const invite = await getInvitationByTokenHash(db, tokenHash)

    if (!invite) {
      throw new Error('Invalid or expired invitation')
    }

    const isMember = await isTeamMember(db, invite.organizationId, context.user.id)
    if (isMember) {
      return { success: true, slug: invite.organization.slug }
    }

    if (invite.email.toLowerCase() !== (context.user.email || '').toLowerCase()) {
      throw new Error(`This invitation is for ${invite.email}, but you are signed in as ${context.user.email}`)
    }

    await acceptInvitation(db, invite.id, context.user.id)
    setActiveTeamSlug(invite.organization.slug)
    setActiveTeamId(invite.organizationId)
    return { success: true, slug: invite.organization.slug }
  })

// ============================================================================
// Context Server Functions (POST) - from context-actions.ts
// ============================================================================

const switchTeamSchema = z.object({
  slug: z.string(),
})

export const switchTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(switchTeamSchema)
  .handler(async ({ context, data }) => {
    const team = await getTeamBySlug(db, data.slug)
    if (!team) {
      throw new Error('Team not found')
    }

    const isMember = await isTeamMember(db, team.id, context.user.id)
    if (!isMember) {
      throw new Error('Not a member of this team')
    }

    setActiveTeamSlug(team.slug)
    setActiveTeamId(team.id)

    return { success: true }
  })

// ============================================================================
// Ensure Default Team Server Function
// ============================================================================

/**
 * Ensures the current user has at least one team.
 * Creates a default team if they don't have any.
 * Idempotent - safe to call multiple times (cached via React Query).
 */
export const ensureDefaultTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    // Get user's display name for team naming
    const { getProfile } = await import('../profiles/queries')
    const { getUserDisplayName } = await import('../profiles/utils')

    const profile = await getProfile(context.user.id)
    const displayName = getUserDisplayName(profile, context.user.email)

    const team = await ensureDefaultTeam(db, context.user.id, displayName)

    return { teamId: team.id, teamSlug: team.slug }
  })
