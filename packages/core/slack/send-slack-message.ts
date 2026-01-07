import { WebClient } from '@slack/web-api'
import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../env/server'

let _client: WebClient | null = null

function getClient() {
  if (!_client && serverEnv.VALBOT_SLACK_TOKEN) {
    _client = new WebClient(serverEnv.VALBOT_SLACK_TOKEN)
  }
  return _client
}

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const postMessage: SendSlackMessage = async (message) => {
  const client = getClient()
  if (client) {
    await client.chat.postMessage(message)
  }
}
