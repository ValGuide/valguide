import { createServerFn } from '@tanstack/react-start'
import { serverEnv } from '@valguide/core/env/server'
import { UnauthenticatedError } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { db } from '@valguide/core/features/db'
import { studioFeedbackMessage } from '@valguide/slack/messages/studio-feedback.message'
import { postMessage } from '@valguide/slack/send-slack-message'
import { createClient } from '@valguide/supabase/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { organization } from '../orgs/schema'
import { feedback } from './schema'

// Re-export UploadCredentials type for consistency
export type { UploadCredentials } from '../assets/server-functions'

import type { UploadCredentials } from '../assets/server-functions'

// Allowed MIME types for screenshot uploads (validated on both client and server)
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

// ============================================================================
// Upload Credentials for Feedback Screenshots (GET)
// ============================================================================

export const getFeedbackUploadCredentialsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async (): Promise<UploadCredentials> => {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new UnauthenticatedError()
    }

    const supabaseUrl = serverEnv.SUPABASE_URL
    const projectId = new URL(supabaseUrl).hostname.split('.')[0]

    if (!projectId) {
      throw new Error('Could not extract project ID from Supabase URL')
    }

    return {
      accessToken: session.access_token,
      projectId,
    }
  })

// ============================================================================
// Submit Feedback (POST)
// ============================================================================

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
  .handler(async ({ context, data }) => {
    const supabase = await createClient()

    // Get screenshot public URL if path provided
    // Gracefully handle storage lookup failures - feedback should still be submitted
    let screenshotUrl: string | null = null
    if (data.screenshotPath) {
      try {
        const { data: urlData } = supabase.storage.from('studio-feedback').getPublicUrl(data.screenshotPath)
        screenshotUrl = urlData.publicUrl
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
        }),
      )
    } catch (slackErr) {
      // Log Slack failure but don't fail the request
      // Feedback is already saved in DB
      console.error('Failed to send feedback to Slack:', slackErr)
    }

    return { success: true, feedbackId: record.id }
  })
