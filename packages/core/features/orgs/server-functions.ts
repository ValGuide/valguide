import {createHash, randomBytes} from 'node:crypto'
import {createServerFn} from '@tanstack/react-start'
import {sendEmail} from '@valguide/transactional'
import {cookies} from 'next/headers'
import {z} from 'zod'
import {createClient} from '../../supabase/server'
import {db} from '../db'
import {
    acceptInvitation,
    createInvitation,
    createTeam,
    deleteInvitation,
    removeMember,
    updateMemberRole,
} from './mutations'
import {canManageMembers, type OrgRole} from './permissions'
import {
    getInvitationById,
    getInvitationByTokenHash,
    getTeamById,
    getTeamBySlug,
    getUserRole,
    isTeamMember,
} from './queries'
import {setActiveTeamSlug} from "@valguide/features/utils/cookies.ts";

const createTeamSchema = z.object({
    name: z.string(),
    slug: z.string().optional(),
})

export const createTeamFn = createServerFn({method: 'POST'})
    .inputValidator(createTeamSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const team = await createTeam(db, data.name, user.sub, data.slug)

        const cookieStore = await cookies()
        cookieStore.set('active-team-slug', team.slug, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
        })

        return team
    })

const inviteMemberSchema = z.object({
    teamId: z.string(),
    email: z.string().email(),
    role: z.enum(['owner', 'admin', 'member', 'viewer']),
})

export const inviteMemberFn = createServerFn({method: 'POST'})
    .inputValidator(inviteMemberSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const currentUserRole = await getUserRole(db, data.teamId, user.sub)

        if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
            throw new Error('Insufficient permissions')
        }

        const team = await getTeamById(db, data.teamId)
        if (!team) throw new Error('Team not found')

        const token = randomBytes(32).toString('hex')
        const tokenHash = createHash('sha256').update(token).digest('hex')

        await createInvitation(db, data.teamId, data.email, data.role as OrgRole, user.sub, tokenHash)

        await sendEmail({
            to: data.email,
            subject: `Join ${team.name} on ValGuide`,
            template: {
                name: 'team-invite',
                data: {
                    inviteLink: `${process.env.NEXT_PUBLIC_STUDIO_URL}/join-team?token=${token}`,
                    teamName: team.name,
                    inviterName: user.email || 'A colleague',
                    logoUrl: `${process.env.NEXT_PUBLIC_STUDIO_URL}/icon.png`,
                },
            },
        })

        console.log(`Invite link for ${data.email}: /join-team?token=${token}`)
    })

const resendInviteSchema = z.object({
    inviteId: z.string(),
    teamId: z.string(),
})

export const resendInviteFn = createServerFn({method: 'POST'})
    .inputValidator(resendInviteSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const currentUserRole = await getUserRole(db, data.teamId, user.sub)

        if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
            throw new Error('Insufficient permissions')
        }

        const invite = await getInvitationById(db, data.inviteId)
        if (!invite) throw new Error('Invitation not found')

        const team = await getTeamById(db, data.teamId)
        if (!team) throw new Error('Team not found')

        const token = randomBytes(32).toString('hex')
        const tokenHash = createHash('sha256').update(token).digest('hex')

        await createInvitation(db, data.teamId, invite.email, invite.role as OrgRole, user.sub, tokenHash)

        await sendEmail({
            to: invite.email,
            subject: `Join ${team.name} on ValGuide`,
            template: {
                name: 'team-invite',
                data: {
                    inviteLink: `${process.env.NEXT_PUBLIC_STUDIO_URL}/join-team?token=${token}`,
                    teamName: team.name,
                    inviterName: user.email || 'A colleague',
                    logoUrl: `${process.env.NEXT_PUBLIC_STUDIO_URL}/icon.png`,
                },
            },
        })

        console.log(`Resend invite link for ${invite.email}: /join-team?token=${token}`)
    })

const cancelInviteSchema = z.object({
    inviteId: z.string(),
    teamId: z.string(),
})

export const cancelInviteFn = createServerFn({method: 'POST'})
    .inputValidator(cancelInviteSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const currentUserRole = await getUserRole(db, data.teamId, user.sub)

        if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
            throw new Error('Insufficient permissions')
        }

        await deleteInvitation(db, data.inviteId)
    })

const removeMemberSchema = z.object({
    memberId: z.string(),
    teamId: z.string(),
})

export const removeMemberFn = createServerFn({method: 'POST'})
    .inputValidator(removeMemberSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const currentUserRole = await getUserRole(db, data.teamId, user.sub)

        if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
            throw new Error('Insufficient permissions')
        }

        await removeMember(db, data.memberId)
    })

const updateMemberRoleSchema = z.object({
    memberId: z.string(),
    teamId: z.string(),
    newRole: z.enum(['owner', 'admin', 'member', 'viewer']),
})

export const updateMemberRoleFn = createServerFn({method: 'POST'})
    .inputValidator(updateMemberRoleSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const currentUserRole = await getUserRole(db, data.teamId, user.sub)

        if (!currentUserRole || !canManageMembers(currentUserRole as OrgRole)) {
            throw new Error('Insufficient permissions')
        }

        await updateMemberRole(db, data.memberId, data.newRole as OrgRole)
    })

const joinTeamSchema = z.object({
    token: z.string(),
})

export const joinTeamFn = createServerFn({method: 'POST'})
    .inputValidator(joinTeamSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const tokenHash = createHash('sha256').update(data.token).digest('hex')
        const invite = await getInvitationByTokenHash(db, tokenHash)

        if (!invite) {
            throw new Error('Invalid or expired invitation')
        }

        const isMember = await isTeamMember(db, invite.organizationId, user.sub)
        if (isMember) {
            return {success: true, slug: invite.organization.slug}
        }

        if (invite.email.toLowerCase() !== (user.email || '').toLowerCase()) {
            throw new Error(`This invitation is for ${invite.email}, but you are signed in as ${user.email}`)
        }

        await acceptInvitation(db, invite.id, user.sub)

        const cookieStore = await cookies()
        cookieStore.set('active-team-slug', invite.organization.slug, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
        })

        return {success: true, slug: invite.organization.slug}
    })

// ============================================================================
// Context Server Functions (POST) - from context-actions.ts
// ============================================================================

const switchTeamSchema = z.object({
    slug: z.string(),
})

export const switchTeamFn = createServerFn({method: 'POST'})
    .inputValidator(switchTeamSchema)
    .handler(async ({data}) => {
        const supabase = await createClient()
        const {data: claimsData} = await supabase.auth.getClaims()
        const user = claimsData?.claims

        if (!user) {
            throw new Error('Unauthorized')
        }

        const team = await getTeamBySlug(db, data.slug)
        if (!team) {
            throw new Error('Team not found')
        }

        const isMember = await isTeamMember(db, team.id, user.sub)
        if (!isMember) {
            throw new Error('Not a member of this team')
        }

        setActiveTeamSlug(team.slug)

        return {success: true}
    })
