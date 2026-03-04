import type { SlackMessage } from '@valguide/slack/slack-message'
import { resolveAdminUsersUrl } from './admin-url'
import { resolveUsersSlackChannel } from './user-channel'

type Props = {
  email?: string
  userId: string
  status: 'approved' | 'blocked' | 'pending'
  timestampMs: number
}

function statusLabel(status: Props['status']): string {
  if (status === 'approved') return '✅ Approved'
  if (status === 'blocked') return '⛔ Blocked'
  return '⏳ Pending'
}

function formatSlackDate(timestampMs: number): string {
  const timestampSeconds = Math.floor(timestampMs / 1000)
  return `<!date^${timestampSeconds}^{date_short_pretty} at {time}|${new Date(timestampMs).toISOString()}>`
}

export const userLoggedInMessage = ({ email, userId, status, timestampMs }: Props): SlackMessage => ({
  channel: resolveUsersSlackChannel(),
  text: `👋 User login completed (${status})`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*👋 User Login Completed*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Email*\n${email ?? '-'}\n`,
        },
        {
          type: 'mrkdwn',
          text: `*Status*\n${statusLabel(status)}\n`,
        },
        {
          type: 'mrkdwn',
          text: `*User ID*\n\`${userId}\``,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(timestampMs)}`,
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Open Admin',
            emoji: true,
          },
          url: resolveAdminUsersUrl(),
          action_id: 'open_login_admin',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
