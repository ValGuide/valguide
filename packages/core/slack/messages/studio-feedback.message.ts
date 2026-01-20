import type { SlackMessage } from '@valguide/slack/slack-message'

type Props = {
  feedback: string
  userEmail: string
  userName?: string
  teamName?: string
  teamNanoId?: string
}

export const studioFeedbackMessage = ({
  feedback,
  userEmail,
  userName,
  teamName,
  teamNanoId,
}: Props): SlackMessage => ({
  channel: 'studio-feedback',
  text: `💬 New Studio Feedback from ${userName ?? userEmail}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '💬 New Studio Feedback',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*From:*\n${userName ?? userEmail}`,
        },
        {
          type: 'mrkdwn',
          text: `*Email:*\n${userEmail}`,
        },
      ],
    },
    ...(teamName
      ? [
          {
            type: 'section' as const,
            fields: [
              {
                type: 'mrkdwn' as const,
                text: `*Team:*\n${teamName}`,
              },
              {
                type: 'mrkdwn' as const,
                text: `*Team ID:*\n${teamNanoId ?? '-'}`,
              },
            ],
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Feedback:*\n${feedback}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Submitted at <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|${new Date().toISOString()}>`,
        },
      ],
    },
  ],
})
