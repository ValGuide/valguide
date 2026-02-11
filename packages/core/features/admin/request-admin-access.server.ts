import { adminAccessRequestMessage } from '@valguide/slack/messages/admin-access-request.message'
import { postMessage } from '@valguide/slack/send-slack-message'

export async function requestAdminAccess(email: string): Promise<void> {
  try {
    await postMessage(adminAccessRequestMessage({ email }))
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to send admin access request to Slack:', error)
  }
}
