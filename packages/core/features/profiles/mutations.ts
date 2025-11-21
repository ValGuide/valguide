import { eq } from 'drizzle-orm'
import { db } from '@valguide/core/features/db'
import { profiles } from './schema'

export type UpdateProfileData = Partial<typeof profiles.$inferInsert>

export async function updateProfile(userId: string, data: UpdateProfileData) {
  return db
    .update(profiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning()
}
