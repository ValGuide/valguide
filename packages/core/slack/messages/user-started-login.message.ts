import type { SlackMessage } from '@valguide/slack/slack-message'

type Props = {
  email?: string
}

export const userStartedLoginMessage = ({ email }: Props): SlackMessage => ({
  channel: 'valguide-users',
  text: '👋 A user started the login process',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '👋 A user started the login process',
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
