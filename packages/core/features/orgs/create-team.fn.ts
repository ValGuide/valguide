import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { setActiveTeamId } from '@valguide/features/utils/cookies.ts'
import { z } from 'zod'
import { valguideId } from '../../utils/nanoid'
import { requireAuthMiddleware } from '../auth/middleware'
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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createTeamSchema = z.object({
  name: z.string(),
})

export const createTeamFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createTeamSchema)
  .handler(async ({ context, data }): Promise<CreateTeamResult> => {
    const team = await createTeam(db, data.name, context.user.id)
    setActiveTeamId(team.id)
    return { success: true, team }
  })
