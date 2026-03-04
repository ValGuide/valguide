import type { SlackMessage } from '@valguide/slack/slack-message'

type Props = {
  email?: string
}

export const userLoggedInMessage = ({ email }: Props): SlackMessage => ({
  channel: 'valguide-users',
  text: '✅ A user completed login',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '✅ A user completed login',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Email* ${email ?? '-'}`,
      },
    },
    {
      type: 'divider',
    },
  ],
})
