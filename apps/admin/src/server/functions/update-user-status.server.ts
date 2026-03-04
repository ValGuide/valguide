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
  const now = new Date()

  await dbClient.transaction(async (tx) => {
    if (status === 'approved') {
      await tx
        .update(profiles)
        .set({
          status: 'approved',
          approvedAt: now,
          blockedAt: null,
          blockedReason: null,
        })
        .where(eq(profiles.id, userId))
      return
    }

    await tx
      .update(profiles)
      .set({
        status: 'blocked',
        blockedAt: now,
        blockedReason: blockedReason ?? null,
      })
      .where(eq(profiles.id, userId))

    await tx.delete(authSessions).where(eq(authSessions.userId, userId))
  })

  return { success: true }
}
