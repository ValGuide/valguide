import { eq } from 'drizzle-orm'
import { db } from '../db'
import { profiles } from './schema'

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function deleteAccount(userId: string): Promise<void> {
  await db.delete(profiles).where(eq(profiles.id, userId))
}
