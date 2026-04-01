import { studioBlockedAccessMessage } from '@valguide/slack/messages/studio-blocked-access.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'

type NotifyStudioBlockedAccessInput = {
  email: string
}

export async function notifyStudioBlockedAccess({ email }: NotifyStudioBlockedAccessInput): Promise<void> {
  try {
    await sendSlackMessage(studioBlockedAccessMessage({ email }))
  } catch (error) {
    console.error(`[Slack][studio_blocked_access] Failed to send notification for email ${email}:`, error)
  }
}
