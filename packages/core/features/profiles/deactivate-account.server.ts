import { eq } from 'drizzle-orm'
import type { DB } from '../db'
import { db } from '../db'
import { logUserStatusEvent } from './log-user-status-event.server'
import { profiles } from './schema'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deactivateAccount(userId: string, dbClient: DB = db): Promise<void> {
  await dbClient
    .update(profiles)
    .set({
      status: 'deactivated',
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))

  await logUserStatusEvent(
    {
      userId,
      previousStatus: 'approved',
      newStatus: 'deactivated',
      changedByUserId: userId,
      source: 'self_service',
    },
    dbClient,
  )
}
