import { eq } from 'drizzle-orm'
import type { DB } from '../db'
import { db } from '../db'
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
}
