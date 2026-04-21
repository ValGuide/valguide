import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'
import { formatSlackDate } from './slack-date'

type Props = {
  email?: string
  timestampMs: number
}

export const userStartedLoginMessage = ({ email, timestampMs }: Props): SlackMessage => ({
  channel: serverEnv.USERS_SLACK_CHANNEL,
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
