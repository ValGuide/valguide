import { eq } from 'drizzle-orm'
import { db } from '../db'
import { getOrCreateProfile } from '../profiles/get-or-create-profile.server'
import { profiles } from '../profiles/schema'
import { autoApproveIfEligible } from './auto-approve-user.server'

export type UserStatus = 'pending' | 'approved' | 'blocked'

export async function getUserStatus(userId: string, email?: string): Promise<UserStatus> {
  const result = await db.select({ status: profiles.status }).from(profiles).where(eq(profiles.id, userId)).limit(1)

  if (result.length === 0) {
    const profile = await getOrCreateProfile(userId, email)
    return profile.status
  }

  const status = result[0].status

  if (status === 'pending' && email) {
    const approved = await autoApproveIfEligible(userId, email)
    if (approved) return 'approved'
  }

  return status
}
