import { db } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { profiles } from './schema'

export async function getProfile(userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
}
