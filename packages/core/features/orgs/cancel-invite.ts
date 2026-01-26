import { createServerFn } from '@tanstack/react-start'
import { type DB, db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireOrgRole } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { organizationInvitation } from './schema'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

/**
 * Cancel/Delete an invitation
 */
export async function deleteInvitation(dbClient: DB, invitationId: string) {
  return dbClient.delete(organizationInvitation).where(eq(organizationInvitation.id, invitationId))
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const cancelInviteSchema = z.object({
  inviteId: z.string(),
  teamId: z.string(),
})

export const cancelInviteFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(cancelInviteSchema)
  .handler(async ({ context, data }) => {
    await requireOrgRole(data.teamId, context.user.id, 'admin')

    await deleteInvitation(db, data.inviteId)
  })
