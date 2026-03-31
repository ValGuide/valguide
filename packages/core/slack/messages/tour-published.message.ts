import type { SlackMessage } from '@valguide/slack/slack-message'
import { formatSlackDate } from './slack-date'
import { resolveStudioEventsSlackChannel } from './studio-events-channel'
import { resolveStudioTourEditUrl } from './studio-url'

type Props = {
  actorEmail: string | null
  isFirstPublishedTour: boolean
  locale: string
  orgName: string
  publishedStopCount: number
  timestampMs: number
  tourNanoId: string
  tourTitle: string | null
}

function headline(isFirstPublishedTour: boolean): string {
  return isFirstPublishedTour ? '🚀 First Tour Published' : '🚀 Tour Published'
}

export const tourPublishedMessage = ({
  actorEmail,
  isFirstPublishedTour,
  locale,
  orgName,
  publishedStopCount,
  timestampMs,
  tourNanoId,
  tourTitle,
}: Props): SlackMessage => ({
  channel: resolveStudioEventsSlackChannel(),
  text: `${headline(isFirstPublishedTour)}: ${tourTitle ?? 'Untitled tour'}`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${headline(isFirstPublishedTour)}*`,
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
          text: `*Published Stops*\n${publishedStopCount}`,
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
          action_id: 'open_published_tour',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
})
