import type { SlackMessage } from '@valguide/slack/slack-message'
import { formatSlackDate } from './slack-date'
import { resolveUsersSlackChannel } from './user-channel'

type Props = {
  email?: string
  timestampMs: number
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
