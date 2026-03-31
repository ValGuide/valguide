import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../env/server'

export type SendSlackMessage = (message: SlackMessage) => Promise<void>

export const sendSlackMessage: SendSlackMessage = async (message) => {
  if (!serverEnv.VALBOT_SLACK_TOKEN) {
    console.warn('[Slack] VALBOT_SLACK_TOKEN is not set. Skipping Slack notification.')
    return
  }

  try {
    const title = 'text' in message ? message.text : undefined
    console.info(`[Slack] Sending message to channel ${message.channel}${title ? `. Title: ${title}` : ''}`)
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${serverEnv.VALBOT_SLACK_TOKEN}`,
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Slack API request failed with status ${response.status}`)
    }

    const result = (await response.json()) as { ok?: boolean; error?: string }
    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error ?? 'unknown_error'}`)
    }
  } catch (e) {
    console.error('[Slack] Error sending message:', e)
  }
}
