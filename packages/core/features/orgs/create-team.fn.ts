import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { setActiveOrganizationForCurrentSession } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { type CreateTeamResult, createTeam } from './create-team.server'
import { notifyTeamCreated } from './notify-team-created.server'

export type { CreateTeamResult } from './create-team.server'

const createTeamSchema = z.object({
  name: z.string(),
})

export const createTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTeamSchema)
  .handler(async ({ context, data }): Promise<CreateTeamResult> => {
    const { team, orgSlug } = await createTeam(db, data.name, context.user.id)
    await setActiveOrganizationForCurrentSession(team.id)
    notifyTeamCreated({
      actorEmail: context.user.email ?? null,
      createdVia: 'studio',
      orgName: team.name,
      orgNanoId: team.nanoId,
      orgSlug,
    }).catch((error) => {
      console.error('Failed to send team created notification to Slack:', error)
    })
    return { success: true, team, orgSlug }
  })
