import { eq } from 'drizzle-orm'
import { db } from '../db'
import { notifyNewSignup } from './notify-new-signup.server'
import { profiles } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Profile = typeof profiles.$inferSelect

// =============================================================================
// DB LOGIC
// =============================================================================

export async function getOrCreateProfile(userId: string, email?: string): Promise<Profile> {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })

  if (existing) {
    return existing
  }

  const [created] = await db.insert(profiles).values({ id: userId }).onConflictDoNothing().returning()

  const profile = created ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, userId) }))!

  if (email) {
    notifyNewSignup(email).catch((err) => console.error('Failed to send signup notification:', err))
  }

  return profile
}
