import type { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api'
import { createLogger } from '@valguide/logger'

const log = createLogger('slack')

const token = process.env.VG_SLACK_TOKEN

export type SlackMessage = ChatPostMessageArguments

export const sendSlackMessage = async (message: SlackMessage) => {
  if (token) {
    try {
      log.info('Sending Slack message', message)
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })

      const data = (await response.json()) as ChatPostMessageResponse
      if (!data.ok) {
        log.error('Failed to send Slack message', data.error)
      }
    } catch (e) {
      log.error('Failed to send Slack message', e)
    }
  } else {
    log.warn('Slack client not initialized')
  }
}
