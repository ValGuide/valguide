import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { type CreateTeamResult, createTeam } from './create-team.server'

export type { CreateTeamResult } from './create-team.server'

const createTeamSchema = z.object({
  name: z.string(),
})

export const createTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTeamSchema)
  .handler(async ({ context, data }): Promise<CreateTeamResult> => {
    const team = await createTeam(db, data.name, context.user.id)
    setActiveTeamId(team.id)
    return { success: true, team }
  })
