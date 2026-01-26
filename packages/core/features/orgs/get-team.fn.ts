import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { organization } from './schema'
import type { Organization } from './types'
import { isTeamMember } from './utils'

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

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const getTeamSchema = z.object({
  id: z.string(),
})

export const getTeamFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(getTeamSchema)
  .handler(async ({ context, data }) => {
    // Verify user is member of this team
    const isMember = await isTeamMember(db, data.id, context.user.id)
    if (!isMember) {
      return null
    }
    return getTeamById(db, data.id)
  })
