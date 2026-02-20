import { WebClient } from '@slack/web-api'
import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../env/server'

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const postMessage: SendSlackMessage = async (message) => {
  if (!serverEnv.VALBOT_SLACK_TOKEN) return
  const client = new WebClient(serverEnv.VALBOT_SLACK_TOKEN)
  await client.chat.postMessage(message)
}
