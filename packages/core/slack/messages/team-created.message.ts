import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'
import { resolveAdminOrgUrl } from './admin-url'
import { formatSlackDate } from './slack-date'

type Props = {
  actorEmail: string | null
  createdVia: 'admin' | 'studio'
  orgName: string
  orgNanoId: string
  orgSlug: string
  timestampMs: number
}

function sourceLabel(createdVia: Props['createdVia']): string {
  return createdVia === 'admin' ? 'Admin' : 'Studio'
}

export const teamCreatedMessage = ({
  actorEmail,
  createdVia,
  orgName,
  orgNanoId,
  orgSlug,
  timestampMs,
}: Props): SlackMessage => ({
  channel: serverEnv.STUDIO_EVENTS_SLACK_CHANNEL,
  text: `🏢 New team created: ${orgName}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🏢 New Team Created*',
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
          text: `*Slug*\n\`${orgSlug}\``,
        },
        {
          type: 'mrkdwn',
          text: `*By*\n${actorEmail ?? 'Unknown'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Source*\n${sourceLabel(createdVia)}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(timestampMs)}`,
        },
        {
          type: 'mrkdwn',
          text: `*Org ID*\n\`${orgNanoId}\``,
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
            text: 'Open Admin Org',
            emoji: true,
          },
          url: resolveAdminOrgUrl(orgNanoId),
          action_id: 'open_admin_org',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
