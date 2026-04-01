import { userLoggedInMessage } from '@valguide/slack/messages/user-logged-in.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'
import type { UserStatus } from './get-user-status.server'

type NotifyUserLoggedInInput = {
  email?: string
  status: UserStatus
  userId: string
}

export async function notifyUserLoggedIn({ email, status, userId }: NotifyUserLoggedInInput): Promise<void> {
  try {
    await sendSlackMessage(
      userLoggedInMessage({
        email,
        status,
        timestampMs: Date.now(),
        userId,
      }),
    )
  } catch (error) {
    console.error(`[Slack][user_logged_in] Failed to send notification for user ${userId}:`, error)
  }
}
