import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { studioFeedbackMessage } from '@valguide/slack/messages/studio-feedback.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { z } from 'zod'

const submitFeedbackSchema = z.object({
  feedback: z.string().min(1).max(5000),
  userName: z.string().optional(),
  teamName: z.string().optional(),
  teamNanoId: z.string().optional(),
})

export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(submitFeedbackSchema)
  .handler(async ({ context, data }) => {
    const { feedback, userName, teamName, teamNanoId } = data
    const { user } = context

    await postMessage(
      studioFeedbackMessage({
        feedback,
        userEmail: user.email ?? 'unknown',
        userName,
        teamName,
        teamNanoId,
      }),
    )

    return { success: true }
  })
