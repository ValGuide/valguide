import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { organization } from './schema'
import type { Organization } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type { Organization }

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Get a team by ID
 */
export async function getTeamById(dbClient: DB, id: string): Promise<Organization | undefined> {
  return dbClient.query.organization.findFirst({
    where: eq(organization.id, id),
  })
}
