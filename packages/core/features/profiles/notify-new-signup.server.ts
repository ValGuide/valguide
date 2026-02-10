import { newSignupMessage } from '../../slack/messages/new-signup.message'
import { postMessage } from '../../slack/send-slack-message'

export async function notifyNewSignup(userEmail: string) {
  await postMessage(newSignupMessage({ email: userEmail }))
}
