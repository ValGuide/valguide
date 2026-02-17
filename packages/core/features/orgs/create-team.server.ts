import type { DB } from '@valguide/core/features/db'
import { valguideId } from '../../utils/nanoid'
import { generateUniqueOrgSlug } from './generate-unique-org-slug.server'
import { organization, organizationMember } from './schema'
import type { Organization } from './types'

// =============================================================================
// TYPES
// =============================================================================

export type CreateTeamResult = {
  success: true
  team: Organization
  orgSlug: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Create a new team with the user as owner and a primary slug.
 */
export async function createTeam(
  dbClient: DB,
  name: string,
  userId: string,
): Promise<{ team: Organization; orgSlug: string }> {
  // Generate unique slug before the transaction (requires DB reads)
  const slug = await generateUniqueOrgSlug(dbClient, name)

  return await dbClient.transaction(async (tx: DB) => {
    const [newTeam] = await tx
      .insert(organization)
      .values({
        nanoId: valguideId(),
        name,
        slug,
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

    // No organizationSlug insert needed — slug is on the org row
    // Redirect table is only for OLD slugs when changing

    return { team: newTeam, orgSlug: slug }
  })
}
