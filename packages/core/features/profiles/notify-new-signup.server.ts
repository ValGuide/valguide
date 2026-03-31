import { newSignupMessage } from '../../slack/messages/new-signup.message'
import { sendSlackMessage } from '../../slack/send-slack-message'

export async function notifyNewSignup(userEmail: string) {
  await sendSlackMessage(newSignupMessage({ email: userEmail }))
}
