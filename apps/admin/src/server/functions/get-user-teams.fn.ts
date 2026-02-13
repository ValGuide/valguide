import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/get-user-teams.server'
import { adminMiddleware } from '../middleware'

export type { OrganizationWithRole } from '@valguide/core/features/orgs/get-user-teams.server'

export const getUserTeamsFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    return getUserTeams(db, context.user.id)
  })
