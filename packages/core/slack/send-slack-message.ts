import { WebClient } from '@slack/web-api'
import { SlackMessage } from '@valguide/slack/slack-message'

const token = process.env.VALBOT_SLACK_TOKEN

const slackClient = token ? new WebClient(token) : undefined

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const postMessage: SendSlackMessage = async (message) => {
  if (slackClient) {
    await slackClient.chat.postMessage(message)
  }
}
