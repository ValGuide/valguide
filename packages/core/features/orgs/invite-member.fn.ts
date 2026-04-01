import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgRole } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamById } from './get-team.server'
import { ORG_ROLES } from './schema'

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

    await auth.api.createInvitation({
      headers: getRequestHeaders(),
      body: {
        organizationId: data.teamId,
        email: data.email,
        role: data.role,
      },
    })

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.invite_sent',
      organizationNanoId: team?.nanoId ?? null,
      properties: {
        role: data.role,
        resend: false,
      },
    })
  })
