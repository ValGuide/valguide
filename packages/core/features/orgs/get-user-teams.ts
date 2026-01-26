import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { requireAuthMiddleware } from '../auth/middleware'
import { organizationMember } from './schema'
import type { OrganizationWithRole } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type { OrganizationWithRole }

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get all teams a user belongs to
 */
export async function getUserTeams(dbClient: DB, userId: string): Promise<OrganizationWithRole[]> {
  const members = await dbClient.query.organizationMember.findMany({
    where: eq(organizationMember.userId, userId),
    with: {
      organization: true,
    },
  })

  return members.map((m) => ({
    ...m.organization,
    role: m.role,
  }))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const getUserTeamsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return getUserTeams(db, context.user.id)
  })
