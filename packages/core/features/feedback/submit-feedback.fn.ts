import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createServerFn } from '@tanstack/react-start'
import { studioFeedbackMessage } from '@valguide/slack/messages/studio-feedback.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { getR2Bucket, getR2Client } from '../storage/r2'
import { feedback } from './schema'

// =============================================================================
// TYPES
// =============================================================================

// Allowed MIME types for screenshot uploads (validated on both client and server)
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

export type SubmitFeedbackInput = {
  feedback: string
  screenshotPath?: string
  fileName?: string
  fileSize?: number
  mimeType?: (typeof ALLOWED_MIME_TYPES)[number]
  pageUrl?: string
  userName?: string
  teamName?: string
  teamNanoId?: string
}

export type SubmitFeedbackResult = {
  success: boolean
  feedbackId: string
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const submitFeedbackSchema = z.object({
  feedback: z.string().min(1).max(5000),
  screenshotPath: z.string().optional(), // e.g., "studio-feedback/userId/123456.png"
  fileName: z.string().optional(),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024)
    .optional(), // Max 5MB
  mimeType: z.enum(ALLOWED_MIME_TYPES).optional(),
  pageUrl: z.string().url().optional().or(z.literal('')),
  userName: z.string().optional(),
  teamName: z.string().optional(),
  teamNanoId: z.string().optional(),
})

export const submitFeedbackFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(submitFeedbackSchema)
  .handler(async ({ context, data }): Promise<SubmitFeedbackResult> => {
    // Get screenshot signed URL if path provided (bucket is private)
    // Gracefully handle storage lookup failures - feedback should still be submitted
    let screenshotUrl: string | null = null
    if (data.screenshotPath) {
      try {
        screenshotUrl = await getSignedUrl(
          getR2Client(),
          new GetObjectCommand({ Bucket: getR2Bucket(), Key: data.screenshotPath }),
          { expiresIn: 604800 },
        )
      } catch (storageErr) {
        // Log but don't fail - screenshot is optional
        console.error('Failed to get screenshot URL:', storageErr)
      }
    }

    // Resolve team ID from nanoId if provided
    let teamId: string | null = null
    if (data.teamNanoId) {
      const [org] = await db
        .select({ id: organization.id })
        .from(organization)
        .where(eq(organization.nanoId, data.teamNanoId))
        .limit(1)
      teamId = org?.id ?? null
    }

    // Insert feedback record
    const [record] = await db
      .insert(feedback)
      .values({
        userId: context.user.id,
        message: data.feedback,
        screenshotUrl,
        screenshotPath: data.screenshotPath ?? null,
        pageUrl: data.pageUrl || null, // Handle empty string
        teamId,
        userEmail: context.user.email ?? '',
        userName: data.userName ?? null,
        teamName: data.teamName ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
      })
      .returning()

    // Send to Slack - do not fail submission if Slack fails
    try {
      await postMessage(
        studioFeedbackMessage({
          feedback: data.feedback,
          userEmail: context.user.email ?? 'unknown',
          userName: data.userName,
          teamName: data.teamName,
          teamNanoId: data.teamNanoId,
          pageUrl: data.pageUrl || undefined,
          screenshotUrl: screenshotUrl ?? undefined,
          screenshotPath: data.screenshotPath,
        }),
      )
    } catch (slackErr) {
      // Log Slack failure but don't fail the request
      // Feedback is already saved in DB
      console.error('Failed to send feedback to Slack:', slackErr)
    }

    return { success: true, feedbackId: record.id }
  })
