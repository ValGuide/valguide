import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamById } from './get-team.server'
import { isTeamMember } from './utils'

const getTeamSchema = z.object({
  id: z.string(),
})

export const getTeamFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTeamSchema)
  .handler(async ({ context, data }) => {
    // Verify user is member of this team
    const isMember = await isTeamMember(db, data.id, context.user.id)
    if (!isMember) {
      return null
    }
    return getTeamById(db, data.id)
  })
