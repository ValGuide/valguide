import type { SlackMessage } from '@valguide/slack/slack-message'
import { resolveAdminUsersUrl } from './admin-url'
import { resolveUsersSlackChannel } from './user-channel'

type Props = {
  email: string
}

export const newSignupMessage = ({ email }: Props): SlackMessage => ({
  channel: resolveUsersSlackChannel(),
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
