import type { SlackMessage } from '@valguide/slack/slack-message'
import { resolveAdminUsersUrl } from './admin-url'
import { resolveUsersSlackChannel } from './user-channel'

type Props = {
  email: string
}

export const studioBlockedAccessMessage = ({ email }: Props): SlackMessage => ({
  channel: resolveUsersSlackChannel(),
  text: '🔒 Studio blocked access attempt',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🔒 *Studio Access Blocked*',
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
        text: 'User logged in but does not have access to the studio. Account is blocked.',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Review in Admin Panel',
            emoji: true,
          },
          url: resolveAdminUsersUrl(),
          action_id: 'admin_review_button',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
