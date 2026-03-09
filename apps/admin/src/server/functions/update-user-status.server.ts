import { authSessions, authUsers } from '@valguide/core/features/auth/schema'
import type { DB } from '@valguide/core/features/db'
import { profiles } from '@valguide/core/features/profiles/schema'
import { userStatusChangedMessage } from '@valguide/core/slack/messages/user-status-changed.message'
import { postMessage } from '@valguide/core/slack/send-slack-message'
import { eq } from 'drizzle-orm'

export type UpdateUserStatusInput = {
  actorEmail?: string | null
  userId: string
  status: 'approved' | 'blocked'
  blockedReason?: string
}

export async function updateUserStatus(dbClient: DB, input: UpdateUserStatusInput) {
  const { actorEmail, userId, status, blockedReason } = input
  const now = new Date()
  const [existingUser] = await dbClient
    .select({
      email: authUsers.email,
      status: profiles.status,
    })
    .from(profiles)
    .leftJoin(authUsers, eq(profiles.id, authUsers.id))
    .where(eq(profiles.id, userId))
    .limit(1)

  if (!existingUser) {
    throw new Error(`User not found for status update: ${userId}`)
  }

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

  const previousStatus = existingUser.status
  const currentStatus = status
  if (previousStatus !== currentStatus) {
    const action = currentStatus === 'blocked' ? 'blocked' : previousStatus === 'blocked' ? 'unblocked' : 'approved'

    try {
      await postMessage(
        userStatusChangedMessage({
          action,
          actorEmail: actorEmail ?? null,
          blockedReason: currentStatus === 'blocked' ? (blockedReason?.trim() ?? null) : null,
          currentStatus,
          previousStatus,
          targetEmail: existingUser.email,
          timestampMs: now.getTime(),
          userId,
        }),
      )
    } catch (error) {
      console.error('Failed to send user status change notification to Slack:', error)
    }
  }

  return { success: true }
}
