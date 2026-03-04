import { authSessions } from '@valguide/core/features/auth/schema'
import type { DB } from '@valguide/core/features/db'
import { profiles } from '@valguide/core/features/profiles/schema'
import { eq } from 'drizzle-orm'

export type UpdateUserStatusInput = {
  userId: string
  status: 'approved' | 'blocked'
  blockedReason?: string
}

export async function updateUserStatus(dbClient: DB, input: UpdateUserStatusInput) {
  const { userId, status, blockedReason } = input

  if (status === 'approved') {
    await dbClient
      .update(profiles)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        blockedAt: null,
        blockedReason: null,
      })
      .where(eq(profiles.id, userId))
  } else {
    await dbClient
      .update(profiles)
      .set({
        status: 'blocked',
        blockedAt: new Date(),
        blockedReason: blockedReason ?? null,
      })
      .where(eq(profiles.id, userId))

    await dbClient.delete(authSessions).where(eq(authSessions.userId, userId))
  }

  return { success: true }
}
