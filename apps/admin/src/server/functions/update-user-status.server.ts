import { authSessions, authUsers } from '@valguide/core/features/auth/schema'
import type { DB } from '@valguide/core/features/db'
import { logUserStatusEvent } from '@valguide/core/features/profiles/log-user-status-event.server'
import { profiles } from '@valguide/core/features/profiles/schema'
import { eq } from 'drizzle-orm'
import { notifyUserStatusChanged } from './notify-user-status-changed.server'

export type UpdateUserStatusInput = {
  actorEmail?: string | null
  actorUserId?: string | null
  userId: string
  status: 'approved' | 'blocked'
  blockedReason?: string
}

export async function updateUserStatus(dbClient: DB, input: UpdateUserStatusInput) {
  const { actorEmail, actorUserId, userId, status, blockedReason } = input
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

  if (existingUser.status === status) {
    return { success: true }
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

      await logUserStatusEvent(
        {
          userId,
          previousStatus: existingUser.status,
          newStatus: 'approved',
          changedByUserId: actorUserId,
          source: 'admin',
        },
        tx,
      )
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

    await logUserStatusEvent(
      {
        userId,
        previousStatus: existingUser.status,
        newStatus: 'blocked',
        changedByUserId: actorUserId,
        source: 'admin',
        reason: blockedReason ?? null,
      },
      tx,
    )
  })

  const previousStatus = existingUser.status
  const currentStatus = status
  if (previousStatus !== currentStatus) {
    const action =
      currentStatus === 'blocked'
        ? 'blocked'
        : previousStatus === 'deactivated'
          ? 'reactivated'
          : previousStatus === 'blocked'
            ? 'unblocked'
            : 'approved'

    await notifyUserStatusChanged({
      action,
      actorEmail,
      blockedReason: currentStatus === 'blocked' ? (blockedReason?.trim() ?? null) : null,
      currentStatus,
      previousStatus,
      targetEmail: existingUser.email,
      timestampMs: now.getTime(),
      userId,
    })
  }

  return { success: true }
}
