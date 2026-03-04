import type { SlackMessage } from '@valguide/slack/slack-message'
import { resolveUsersSlackChannel } from './user-channel'

type Props = {
  email?: string
  timestampMs: number
}

function formatSlackDate(timestampMs: number): string {
  const timestampSeconds = Math.floor(timestampMs / 1000)
  return `<!date^${timestampSeconds}^{date_short_pretty} at {time}|${new Date(timestampMs).toISOString()}>`
}

export const userStartedLoginMessage = ({ email, timestampMs }: Props): SlackMessage => ({
  channel: resolveUsersSlackChannel(),
  text: '👀 User login started',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*👀 User Login Started*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Email*\n${email ?? '-'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(timestampMs)}`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
