import { userStatusChangedMessage } from '@valguide/core/slack/messages/user-status-changed.message'
import { sendSlackMessage } from '@valguide/core/slack/send-slack-message'

type NotifyUserStatusChangedInput = {
  action: 'approved' | 'blocked' | 'unblocked' | 'reactivated'
  actorEmail?: string | null
  blockedReason?: string | null
  currentStatus: 'approved' | 'blocked' | 'deactivated'
  previousStatus: 'approved' | 'blocked' | 'deactivated' | 'pending'
  targetEmail?: string | null
  timestampMs: number
  userId: string
}

export async function notifyUserStatusChanged({
  action,
  actorEmail,
  blockedReason,
  currentStatus,
  previousStatus,
  targetEmail,
  timestampMs,
  userId,
}: NotifyUserStatusChangedInput): Promise<void> {
  try {
    await sendSlackMessage(
      userStatusChangedMessage({
        action,
        actorEmail: actorEmail ?? null,
        blockedReason: blockedReason ?? null,
        currentStatus,
        previousStatus,
        targetEmail: targetEmail ?? null,
        timestampMs,
        userId,
      }),
    )
  } catch (error) {
    console.error(`[Slack][user_status_changed] Failed to send notification for user ${userId}:`, error)
  }
}
