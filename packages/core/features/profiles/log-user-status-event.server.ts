import type { DB } from '../db'
import { db } from '../db'
import { type UserStatus, type UserStatusChangeSource, userStatusEvent } from './schema'

export type LogUserStatusEventInput = {
  userId: string
  previousStatus: UserStatus
  newStatus: UserStatus
  changedByUserId?: string | null
  source: UserStatusChangeSource
  reason?: string | null
}

export async function logUserStatusEvent(input: LogUserStatusEventInput, dbClient: DB = db): Promise<void> {
  await dbClient.insert(userStatusEvent).values({
    userId: input.userId,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    changedByUserId: input.changedByUserId ?? null,
    source: input.source,
    reason: input.reason ?? null,
  })
}
