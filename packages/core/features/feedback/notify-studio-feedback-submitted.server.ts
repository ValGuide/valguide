import { studioFeedbackMessage } from '@valguide/slack/messages/studio-feedback.message'
import { sendSlackMessage } from '@valguide/slack/send-slack-message'

type NotifyStudioFeedbackSubmittedInput = {
  feedback: string
  feedbackId: string
  linearError?: string
  linearTicket?: { identifier: string; url: string }
  pageUrl?: string
  screenshotPath?: string
  screenshotUrl?: string
  teamName?: string
  teamNanoId?: string
  userEmail: string
  userName?: string
}

export async function notifyStudioFeedbackSubmitted({
  feedback,
  feedbackId,
  linearError,
  linearTicket,
  pageUrl,
  screenshotPath,
  screenshotUrl,
  teamName,
  teamNanoId,
  userEmail,
  userName,
}: NotifyStudioFeedbackSubmittedInput): Promise<void> {
  try {
    await sendSlackMessage(
      studioFeedbackMessage({
        feedback,
        linearError,
        linearTicket,
        pageUrl,
        screenshotPath,
        screenshotUrl,
        teamName,
        teamNanoId,
        timestampMs: Date.now(),
        userEmail,
        userName,
      }),
    )
  } catch (error) {
    console.error(`[Slack][studio_feedback_submitted] Failed to send notification for feedback ${feedbackId}:`, error)
  }
}
