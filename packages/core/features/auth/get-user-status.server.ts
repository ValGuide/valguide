import { eq } from 'drizzle-orm'
import { timeStudioPerformance } from '../../utils/studio-performance'
import { db } from '../db'
import { getOrCreateProfile } from '../profiles/get-or-create-profile.server'
import { profiles } from '../profiles/schema'

export type UserStatus = 'pending' | 'approved' | 'blocked'

export async function getUserStatus(userId: string, email?: string): Promise<UserStatus> {
  const result = await timeStudioPerformance(
    'auth.getUserStatus.profileLookup',
    async () => db.select({ status: profiles.status }).from(profiles).where(eq(profiles.id, userId)).limit(1),
    { userId },
  )

  if (result.length > 0 && result[0].status === 'approved') {
    return 'approved'
  }

  if (result.length > 0 && result[0].status === 'blocked') {
    return 'blocked'
  }

  // Pending or missing: delegate to getOrCreateProfile (handles creation + auto-approve)
  const profile = await timeStudioPerformance(
    'auth.getUserStatus.getOrCreateProfile',
    async () => getOrCreateProfile(userId, email),
    { userId },
  )
  return profile.status
}
