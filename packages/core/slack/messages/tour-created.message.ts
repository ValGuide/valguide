import type { SlackMessage } from '@valguide/slack/slack-message'
import { formatSlackDate } from './slack-date'
import { resolveStudioEventsSlackChannel } from './studio-events-channel'
import { resolveStudioTourEditUrl } from './studio-url'

type Props = {
  actorEmail: string | null
  isFirstCreatedTour: boolean
  locale: string
  orgName: string
  tourCount: number
  tourNanoId: string
  tourTitle: string | null
  timestampMs: number
}

function headline(isFirstCreatedTour: boolean): string {
  return isFirstCreatedTour ? '🗺️ First Tour Created' : '🗺️ Tour Created'
}

export const tourCreatedMessage = ({
  actorEmail,
  isFirstCreatedTour,
  locale,
  orgName,
  tourCount,
  tourNanoId,
  tourTitle,
  timestampMs,
}: Props): SlackMessage => ({
  channel: resolveStudioEventsSlackChannel(),
  text: `${headline(isFirstCreatedTour)}: ${tourTitle ?? 'Untitled tour'}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${headline(isFirstCreatedTour)}*`,
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
          text: `*Locale*\n${locale}`,
        },
        {
          type: 'mrkdwn',
          text: `*Tour Count*\n${tourCount}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time*\n${formatSlackDate(timestampMs)}`,
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
          action_id: 'open_studio_tour',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
