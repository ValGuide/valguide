import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { isOrgRole, member } from './schema'
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
  const members = await dbClient.query.member.findMany({
    where: eq(member.userId, userId),
    with: {
      organization: true,
    },
  })

  return members.flatMap((membership) => {
    if (!isOrgRole(membership.role)) {
      return []
    }

    return {
      ...membership.organization,
      role: membership.role,
    }
  })
}
