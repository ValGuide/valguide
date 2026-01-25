import { createServerFn } from '@tanstack/react-start'
import { requireGuideAccess, requireStopAccess } from '@valguide/core/features/auth/authorization'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { z } from 'zod'
import {
  deleteGuideTranslationDraft,
  deleteStopTranslationDraft,
  publishGuideTranslationDraft,
  publishStopTranslationDraft,
  unpublishGuideTranslation,
  unpublishStopTranslation,
  upsertGuideTranslationDraft,
  upsertStopTranslationDraft,
} from './internal-mutations'

// ============================================================================
// Mutation Server Functions (POST) - Guide Translation
// ============================================================================

const updateGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
})

export const updateGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateGuideTranslationSchema)
  .handler(async ({ context, data }) => {
    const { guideId, locale, title, description } = data
    await requireGuideAccess(guideId, context.user.id)

    const versionId = await upsertGuideTranslationDraft(guideId, locale, { title, description })

    return { versionId }
  })

const publishGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const publishGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishGuideTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return publishGuideTranslationDraft(data.guideId, data.locale)
  })

const discardGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const discardGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardGuideTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    const success = await deleteGuideTranslationDraft(data.guideId, data.locale)
    return { success }
  })

const unpublishGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const unpublishGuideTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishGuideTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireGuideAccess(data.guideId, context.user.id)
    return unpublishGuideTranslation(data.guideId, data.locale)
  })

// ============================================================================
// Mutation Server Functions (POST) - Stop Translation
// ============================================================================

const updateStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string(),
  transcription: z.string(),
})

export const updateStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateStopTranslationSchema)
  .handler(async ({ context, data }) => {
    const { stopId, locale, title, description, transcription } = data
    await requireStopAccess(stopId, context.user.id)

    const versionId = await upsertStopTranslationDraft(stopId, locale, { title, description, transcription })

    return { versionId }
  })

const publishStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const publishStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(publishStopTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return publishStopTranslationDraft(data.stopId, data.locale)
  })

const discardStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const discardStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(discardStopTranslationDraftSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    const success = await deleteStopTranslationDraft(data.stopId, data.locale)
    return { success }
  })

const unpublishStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const unpublishStopTranslationFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(unpublishStopTranslationSchema)
  .handler(async ({ context, data }) => {
    await requireStopAccess(data.stopId, context.user.id)
    return unpublishStopTranslation(data.stopId, data.locale)
  })
