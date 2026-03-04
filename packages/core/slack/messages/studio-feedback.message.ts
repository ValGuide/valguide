import type { SlackMessage } from '@valguide/slack/slack-message'
import { serverEnv } from '../../env/server'

type Props = {
  feedback: string
  userEmail: string
  userName?: string
  teamName?: string
  teamNanoId?: string
  pageUrl?: string
  screenshotUrl?: string
  screenshotPath?: string
}

export const studioFeedbackMessage = ({
  feedback,
  userEmail,
  userName,
  teamName,
  teamNanoId,
  pageUrl,
  screenshotUrl,
  screenshotPath,
}: Props): SlackMessage => {
  const isDevEnv = serverEnv.VITE_ENV === 'dev' || serverEnv.VITE_ENV === 'local'
  const channel = serverEnv.STUDIO_FEEDBACK_SLACK_CHANNEL || (isDevEnv ? 'studio-feedback-dev' : 'studio-feedback')

  return {
    channel,
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
      ...(screenshotUrl
        ? [
            {
              type: 'image' as const,
              image_url: screenshotUrl,
              alt_text: 'User feedback screenshot',
            },
          ]
        : []),
      ...(screenshotPath
        ? [
            {
              type: 'context' as const,
              elements: [
                {
                  type: 'mrkdwn' as const,
                  text: `*Storage:* \`${screenshotPath}\``,
                },
              ],
            },
          ]
        : []),
      ...(pageUrl
        ? [
            {
              type: 'context' as const,
              elements: [
                {
                  type: 'mrkdwn' as const,
                  text: `*Page:* <${pageUrl}|${pageUrl}>`,
                },
              ],
            },
          ]
        : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Submitted <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|${new Date().toISOString()}>`,
          },
        ],
      },
    ],
  }
}
