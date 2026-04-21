import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'
import { formatSlackDate } from './slack-date'
import { resolveStudioTourEditUrl } from './studio-url'

type Props = {
  actorEmail: string | null
  archivedAtMs: number
  orgName: string
  publishedLocaleCount: number
  tourNanoId: string
  tourTitle: string | null
  wasPublished: boolean
}

export const tourArchivedMessage = ({
  actorEmail,
  archivedAtMs,
  orgName,
  publishedLocaleCount,
  tourNanoId,
  tourTitle,
  wasPublished,
}: Props): SlackMessage => ({
  channel: serverEnv.STUDIO_EVENTS_SLACK_CHANNEL,
  text: `🗄️ Tour Archived: ${tourTitle ?? 'Untitled tour'}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🗄️ Tour Archived*',
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
          text: `*Tour*\n${tourTitle ?? 'Untitled tour'}`,
        },
        {
          type: 'mrkdwn',
          text: `*By*\n${actorEmail ?? 'Unknown'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Was Published*\n${wasPublished ? 'Yes' : 'No'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Published Locales*\n${publishedLocaleCount}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(archivedAtMs)}`,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Tour ID: \`${tourNanoId}\``,
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
            text: 'Open Tour',
            emoji: true,
          },
          url: resolveStudioTourEditUrl(tourNanoId),
          action_id: 'open_archived_tour',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
