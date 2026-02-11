import type { SlackMessage } from '@valguide/slack/slack-message'

type Props = {
  email: string
}

export const adminAccessRequestMessage = ({ email }: Props): SlackMessage => ({
  channel: 'valguide-admin',
  text: '🔐 Admin access request',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🔐 *Admin Access Request*',
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
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'User is attempting to access the admin dashboard but is not authorized. Please review and grant access if appropriate.',
      },
    },
    {
      type: 'divider',
    },
  ],
})
