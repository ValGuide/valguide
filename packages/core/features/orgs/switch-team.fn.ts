import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { ForbiddenError, NotFoundError } from '../auth/authorization'
import { setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamById } from './get-team.server'
import { isTeamMember } from './utils'

// =============================================================================
// TYPES
// =============================================================================

export type SwitchTeamResult = {
  success: true
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const switchTeamSchema = z.object({
  id: z.string(),
})

export const switchTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(switchTeamSchema)
  .handler(async ({ context, data }): Promise<SwitchTeamResult> => {
    const team = await getTeamById(db, data.id)
    if (!team) {
      throw new NotFoundError('Team not found')
    }

    const isMember = await isTeamMember(db, team.id, context.user.id)
    if (!isMember) {
      throw new ForbiddenError('Not a member of this team')
    }

    await setActiveOrganizationForCurrentSession(team.id)
    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.switched',
      organizationNanoId: team.nanoId,
    })

    return { success: true }
  })
