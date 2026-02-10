import { eq } from 'drizzle-orm'
import { db } from '../db'
import { profiles } from './schema'

export async function updateProfileAvatar(userId: string, storagePath: string | null) {
  const [result] = await db
    .update(profiles)
    .set({ avatarStoragePath: storagePath, updatedAt: new Date() })
    .where(eq(profiles.id, userId))
    .returning({ avatarStoragePath: profiles.avatarStoragePath })
  return result?.avatarStoragePath ?? null
}
