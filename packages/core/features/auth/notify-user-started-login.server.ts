import { userStartedLoginMessage } from '@valguide/slack/messages/user-started-login.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'

type NotifyUserStartedLoginInput = {
  email?: string
}

export async function notifyUserStartedLogin({ email }: NotifyUserStartedLoginInput): Promise<void> {
  try {
    await sendSlackMessage(
      userStartedLoginMessage({
        email,
        timestampMs: Date.now(),
      }),
    )
  } catch (error) {
    console.error(`[Slack][user_started_login] Failed to send notification for email ${email ?? '-'}:`, error)
  }
}
