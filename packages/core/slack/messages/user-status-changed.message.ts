import type { SlackMessage } from '@valguide/slack/slack-message'
import { resolveAdminUsersUrl } from './admin-url'
import { resolveUsersSlackChannel } from './user-channel'

type UserStatus = 'pending' | 'approved' | 'blocked'
type UserStatusChangeAction = 'approved' | 'blocked' | 'unblocked'

type Props = {
  action: UserStatusChangeAction
  actorEmail: string | null
  blockedReason: string | null
  currentStatus: UserStatus
  previousStatus: UserStatus
  targetEmail: string | null
  timestampMs: number
  userId: string
}

function actionTitle(action: UserStatusChangeAction): string {
  if (action === 'blocked') return '⛔ User blocked'
  if (action === 'unblocked') return '✅ User unblocked'
  return '✅ User approved'
}

function statusLabel(status: UserStatus): string {
  if (status === 'approved') return '✅ Approved'
  if (status === 'blocked') return '⛔ Blocked'
  return '⏳ Pending'
}

function formatSlackDate(timestampMs: number): string {
  const timestampSeconds = Math.floor(timestampMs / 1000)
  return `<!date^${timestampSeconds}^{date_short_pretty} at {time}|${new Date(timestampMs).toISOString()}>`
}

function transitionLabel(previousStatus: UserStatus, currentStatus: UserStatus): string {
  return `${statusLabel(previousStatus)} -> ${statusLabel(currentStatus)}`
}

export const userStatusChangedMessage = ({
  action,
  actorEmail,
  blockedReason,
  currentStatus,
  previousStatus,
  targetEmail,
  timestampMs,
  userId,
}: Props): SlackMessage => ({
  channel: resolveUsersSlackChannel(),
  text: `${actionTitle(action)}${targetEmail ? `: ${targetEmail}` : ''}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${actionTitle(action)}*`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `*User* ${targetEmail ?? '-'}`,
          `*By* ${actorEmail ?? 'Unknown'}`,
          `*Status change* ${transitionLabel(previousStatus, currentStatus)}`,
          `*Time* ${formatSlackDate(timestampMs)}`,
        ].join('\n'),
      },
    },
    ...(blockedReason
      ? [
          {
            type: 'section' as const,
            text: {
              type: 'mrkdwn' as const,
              text: `*Reason*\n${blockedReason}`,
            },
          },
        ]
      : []),
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `User ID: \`${userId}\``,
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
          action_id: 'open_users_admin',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
