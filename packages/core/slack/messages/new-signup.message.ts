import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'
import { resolveAdminUsersUrl } from './admin-url'

type Props = {
  email: string
}

export const newSignupMessage = ({ email }: Props): SlackMessage => ({
  channel: serverEnv.USERS_SLACK_CHANNEL,
  text: `🆕 New signup awaiting approval: ${email}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🆕 New signup awaiting approval',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Email* ${email}`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Review in Admin',
          },
          url: resolveAdminUsersUrl(),
          action_id: 'view_signup_admin',
        },
      ],
    },
  ],
})
