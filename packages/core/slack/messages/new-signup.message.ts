import type { SlackMessage } from '@valguide/slack/slack-message'

type Props = {
  email: string
}

export const newSignupMessage = ({ email }: Props): SlackMessage => ({
  channel: 'valguide-users',
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
          url: 'https://admin.valguide.com/users',
          action_id: 'view_signup_admin',
        },
      ],
    },
  ],
})
