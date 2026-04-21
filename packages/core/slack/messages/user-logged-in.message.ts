import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'
import { resolveAdminUsersUrl } from './admin-url'
import { formatSlackDate } from './slack-date'

type Props = {
  email?: string
  userId: string
  status: 'approved' | 'blocked' | 'deactivated' | 'pending'
  timestampMs: number
}

function statusLabel(status: Props['status']): string {
  if (status === 'approved') return '✅ Approved'
  if (status === 'blocked') return '⛔ Blocked'
  if (status === 'deactivated') return '⏸️ Deactivated'
  return '⏳ Pending'
}

export const userLoggedInMessage = ({ email, userId, status, timestampMs }: Props): SlackMessage => ({
  channel: serverEnv.USERS_SLACK_CHANNEL,
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
