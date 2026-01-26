import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
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
