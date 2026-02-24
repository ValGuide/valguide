import { WebClient } from '@slack/web-api'
import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../env/server'

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const postMessage: SendSlackMessage = async (message) => {
  if (!serverEnv.VALBOT_SLACK_TOKEN) {
    console.warn('[Slack] VALBOT_SLACK_TOKEN is not set. Skipping Slack notification.')
    return
  }

  try {
    const client = new WebClient(serverEnv.VALBOT_SLACK_TOKEN)
    const title = 'text' in message ? message.text : undefined
    console.info(`[Slack] Sending message to channel ${message.channel}${title ? `. Title: ${title}` : ''}`)

    await client.chat.postMessage(message)
  } catch (e) {
    console.error('[Slack] Error sending message:', e)
  }
}
