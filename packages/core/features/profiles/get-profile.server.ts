import { eq } from 'drizzle-orm'
import { db } from '../db'
import { profiles } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Profile = typeof profiles.$inferSelect

// =============================================================================
// DB LOGIC
// =============================================================================

export async function getProfile(userId: string): Promise<Profile | undefined> {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
}
