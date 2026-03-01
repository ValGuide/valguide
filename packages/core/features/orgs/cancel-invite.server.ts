import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { invitation } from './schema'

/**
 * Cancel/Delete an invitation
 */
export async function deleteInvitation(dbClient: DB, invitationId: string) {
  return dbClient.delete(invitation).where(eq(invitation.id, invitationId))
}
