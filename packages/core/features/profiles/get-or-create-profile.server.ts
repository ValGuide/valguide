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

export async function getOrCreateProfile(userId: string): Promise<Profile> {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })

  if (existing) {
    return existing
  }

  const [created] = await db.insert(profiles).values({ id: userId }).onConflictDoNothing().returning()

  return created ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, userId) }))!
}
