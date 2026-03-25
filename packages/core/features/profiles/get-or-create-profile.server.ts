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

  const foundProfile = created ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, userId) }))
  if (!foundProfile) {
    throw new Error('Failed to create or fetch profile')
  }
  let profile = foundProfile

  if (email) {
    const approved = await autoApproveIfEligible(userId, email)
    if (approved) {
      profile = { ...profile, status: 'approved', approvedAt: new Date() }
    }
    if (profile.status === 'pending') {
      notifyNewSignup(email).catch((err) => console.error('Failed to send signup notification:', err))
    }
  }

  return profile
}
