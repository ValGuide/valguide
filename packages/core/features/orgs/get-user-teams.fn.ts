import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { requireAuthMiddleware } from '../auth/middleware'
import { getUserTeams } from './get-user-teams.server'

export type { OrganizationWithRole } from './get-user-teams.server'

export const getUserTeamsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return getUserTeams(db, context.user.id)
  })
