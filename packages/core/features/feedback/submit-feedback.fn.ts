import { createServerFn } from '@tanstack/react-start'
import { createLinearIssue } from '@valguide/linear/create-issue'
import { studioFeedbackIssue } from '@valguide/linear/messages/studio-feedback.issue'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { serverEnv } from '../../env/server'
import { getAssetUrl } from '../assets/image-url'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { organization } from '../orgs/schema'
import { notifyStudioFeedbackSubmitted } from './notify-studio-feedback-submitted.server'
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
    // Build public URL for screenshot if path provided
    let screenshotUrl: string | null = null
    if (data.screenshotPath) {
      screenshotUrl = getAssetUrl(data.screenshotPath)
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
        pageUrl: data.pageUrl ? data.pageUrl : null,
        teamId,
        userEmail: context.user.email ?? '',
        userName: data.userName ?? null,
        teamName: data.teamName ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
      })
      .returning()

    // Create Linear ticket (runs first so we can include the link in Slack)
    let linearTicket: { identifier: string; url: string } | null = null
    let linearError: string | undefined

    try {
      const { title, description } = studioFeedbackIssue({
        feedback: data.feedback,
        userEmail: context.user.email ?? 'unknown',
        userName: data.userName,
        teamName: data.teamName,
        teamNanoId: data.teamNanoId,
        pageUrl: data.pageUrl || undefined,
        screenshotUrl: screenshotUrl ?? undefined,
        feedbackId: record.id,
      })

      const result = await createLinearIssue({
        title,
        description,
        teamId: serverEnv.LINEAR_FEEDBACK_TEAM_ID,
        labelIds: serverEnv.LINEAR_FEEDBACK_LABEL_ID ? [serverEnv.LINEAR_FEEDBACK_LABEL_ID] : undefined,
      })

      if (result) {
        linearTicket = { identifier: result.identifier, url: result.url }
      }
    } catch (err) {
      linearError = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Linear] Failed to create issue:', err)
    }

    await notifyStudioFeedbackSubmitted({
      feedback: data.feedback,
      feedbackId: record.id,
      linearError,
      linearTicket: linearTicket ?? undefined,
      pageUrl: data.pageUrl ? data.pageUrl : undefined,
      screenshotPath: data.screenshotPath,
      screenshotUrl: screenshotUrl ?? undefined,
      teamName: data.teamName,
      teamNanoId: data.teamNanoId,
      userEmail: context.user.email ?? 'unknown',
      userName: data.userName,
    })

    return { success: true, feedbackId: record.id }
  })
