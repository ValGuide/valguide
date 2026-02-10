import { eq } from 'drizzle-orm'
import { autoApproveIfEligible } from '../auth/auto-approve-user.server'
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
    if (existing.status === 'pending' && email) {
      const approved = await autoApproveIfEligible(userId, email)
      if (approved) {
        return { ...existing, status: 'approved', approvedAt: new Date() }
      }
    }
    return existing
  }

  const [created] = await db.insert(profiles).values({ id: userId }).onConflictDoNothing().returning()

  let profile = created ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, userId) }))!

  if (email) {
    const approved = await autoApproveIfEligible(userId, email)
    if (approved) {
      profile = { ...profile, status: 'approved', approvedAt: new Date() }
    }
    notifyNewSignup(email).catch((err) => console.error('Failed to send signup notification:', err))
  }

  return profile
}
