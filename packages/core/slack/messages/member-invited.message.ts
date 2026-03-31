import type { SlackMessage } from '@valguide/slack/slack-message'
import { formatSlackDate } from './slack-date'
import { resolveStudioEventsSlackChannel } from './studio-events-channel'
import { resolveStudioSettingsUrl } from './studio-url'

type Props = {
  invitationId: string
  invitedEmail: string
  inviterEmail: string | null
  orgName: string
  role: string
  timestampMs: number
}

export const memberInvitedMessage = ({
  invitationId,
  invitedEmail,
  inviterEmail,
  orgName,
  role,
  timestampMs,
}: Props): SlackMessage => ({
  channel: resolveStudioEventsSlackChannel(),
  text: `📨 Team member invited: ${invitedEmail}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📨 Team Member Invited*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Team*\n${orgName}`,
        },
        {
          type: 'mrkdwn',
          text: `*Invited*\n${invitedEmail}`,
        },
        {
          type: 'mrkdwn',
          text: `*Role*\n${role}`,
        },
        {
          type: 'mrkdwn',
          text: `*Inviter*\n${inviterEmail ?? 'Unknown'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(timestampMs)}`,
        },
        {
          type: 'mrkdwn',
          text: `*Invitation ID*\n\`${invitationId}\``,
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
            text: 'Open Studio Settings',
            emoji: true,
          },
          url: resolveStudioSettingsUrl(),
          action_id: 'open_studio_settings',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
