import type { User } from '@valguide/features/user/user'
import type { Nullish } from '@valguide/core/utils/types'
import type { SlackMessage } from '@/slack/send-slack-message'

export const newUserSignedUpMessage: (user: Nullish<User>) => SlackMessage = (user) => ({
  channel: '#users',
  text: `🎉 New user signed up`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎉 A new user signed up: "${user.email}"*`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Email* ${user.email ?? '-'}\n*ID* ${user.id ?? '-'}\n`,
      },
    },
    {
      type: 'divider',
    },
  ],
})
