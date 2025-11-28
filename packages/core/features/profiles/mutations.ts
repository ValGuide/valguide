import { db } from '@valguide/core/features/db'
import { profiles } from './schema'

export type UpdateProfileData = Partial<typeof profiles.$inferInsert>

export async function updateProfile(userId: string, data: UpdateProfileData) {
  return db
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
}
