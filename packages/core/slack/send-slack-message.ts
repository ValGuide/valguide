import { WebClient } from '@slack/web-api'
import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../env/server'

const token = serverEnv.VALBOT_SLACK_TOKEN

const slackClient = token ? new WebClient(token) : undefined

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const postMessage: SendSlackMessage = async (message) => {
  if (slackClient) {
    await slackClient.chat.postMessage(message)
  }
}
