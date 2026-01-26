import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getTeamData } from './get-team-data.server'

export type { TeamData } from './get-team-data.server'

const getTeamDataSchema = z.object({})

export const getTeamDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTeamDataSchema)
  .handler(async ({ context }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      return null
    }
    await requireOrgMember(orgId, context.user.id)
    return getTeamData(orgId, context.user.id)
  })
