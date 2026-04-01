import { newSignupMessage } from '../../slack/messages/new-signup.message'
import { sendSlackMessage } from '../../slack/send-slack-message'

type NotifyNewSignupInput = {
  userEmail: string
}

export async function notifyNewSignup({ userEmail }: NotifyNewSignupInput): Promise<void> {
  try {
    await sendSlackMessage(newSignupMessage({ email: userEmail }))
  } catch (error) {
    console.error(`[Slack][new_signup] Failed to send notification for email ${userEmail}:`, error)
  }
}
