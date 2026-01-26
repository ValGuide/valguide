import type { DB } from '@valguide/core/features/db'
import { valguideId } from '../../utils/nanoid'
import { organization, organizationMember } from './schema'
import type { Organization } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type CreateTeamResult = {
  success: true
  team: Organization
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Create a new team with the user as owner
 */
export async function createTeam(dbClient: DB, name: string, userId: string): Promise<Organization> {
  return await dbClient.transaction(async (tx: DB) => {
    const [newTeam] = await tx
      .insert(organization)
      .values({
        nanoId: valguideId(),
        name,
      })
      .returning()

    if (!newTeam) {
      throw new Error('Failed to create team')
    }

    // Add creator as owner
    await tx.insert(organizationMember).values({
      organizationId: newTeam.id,
      userId,
      role: 'owner',
      isOwner: true, // Deprecated but kept for compat
    })

    return newTeam
  })
}
