import { db } from '../db'
import { profiles } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateProfileInput = {
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  is_onboarded?: boolean
}

export type UpdateProfileResult = typeof profiles.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateProfile(userId: string, data: UpdateProfileInput): Promise<UpdateProfileResult> {
  const [result] = await db
    .insert(profiles)
    .values({
      id: userId,
      ...data,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning()

  return result
}
