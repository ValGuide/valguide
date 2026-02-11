import { studioBlockedAccessMessage } from '@valguide/slack/messages/studio-blocked-access.message'
import { postMessage } from '@valguide/slack/send-slack-message'

export async function notifyStudioBlockedAccess(email: string): Promise<void> {
  try {
    await postMessage(studioBlockedAccessMessage({ email }))
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to send studio blocked access notification to Slack:', error)
  }
}
