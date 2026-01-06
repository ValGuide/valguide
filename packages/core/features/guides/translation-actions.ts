import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  publishGuideTranslationDraft as publishDraft,
  publishStopTranslationDraft as publishStopDraft,
  rollbackGuideTranslation as rollbackGuide,
  rollbackStopTranslation as rollbackStop,
} from './translation-mutations'
import {
  getGuideTranslationHistory as getHistory,
  getStopTranslationHistory as getStopHistory,
} from './translation-queries'

const publishGuideTranslationDraftSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const publishGuideTranslationDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(publishGuideTranslationDraftSchema)
  .handler(async ({ data }) => {
    return publishDraft(data.guideId, data.locale)
  })

const publishStopTranslationDraftSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const publishStopTranslationDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(publishStopTranslationDraftSchema)
  .handler(async ({ data }) => {
    return publishStopDraft(data.stopId, data.locale)
  })

const rollbackGuideTranslationSchema = z.object({
  guideId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
  userId: z.string().optional(),
})

export const rollbackGuideTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator(rollbackGuideTranslationSchema)
  .handler(async ({ data }) => {
    return rollbackGuide(data.guideId, data.locale, data.targetVersion, data.userId)
  })

const rollbackStopTranslationSchema = z.object({
  stopId: z.string(),
  locale: z.string(),
  targetVersion: z.number(),
  userId: z.string().optional(),
})

export const rollbackStopTranslationFn = createServerFn({ method: 'POST' })
  .inputValidator(rollbackStopTranslationSchema)
  .handler(async ({ data }) => {
    return rollbackStop(data.stopId, data.locale, data.targetVersion, data.userId)
  })

const getGuideTranslationHistorySchema = z.object({
  guideId: z.string(),
  locale: z.string(),
})

export const getGuideTranslationHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideTranslationHistorySchema)
  .handler(async ({ data }) => {
    return getHistory(data.guideId, data.locale)
  })

const getStopTranslationHistorySchema = z.object({
  stopId: z.string(),
  locale: z.string(),
})

export const getStopTranslationHistoryFn = createServerFn({ method: 'GET' })
  .inputValidator(getStopTranslationHistorySchema)
  .handler(async ({ data }) => {
    return getStopHistory(data.stopId, data.locale)
  })
