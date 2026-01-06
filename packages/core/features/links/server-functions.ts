import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  getOrCreateGuideShortLink,
  getOrCreateStopShortLink,
  getShortLinkByCode,
  getShortLinksForGuide,
} from './queries'

// Schemas

const getShortLinkByCodeSchema = z.object({ code: z.string() })

const getShortLinksForGuideSchema = z.object({ guideNanoId: z.string() })

const getOrCreateGuideShortLinkSchema = z.object({
  guideNanoId: z.string(),
  locale: z.string(),
})

const getOrCreateStopShortLinkSchema = z.object({
  guideNanoId: z.string(),
  stopNanoId: z.string(),
  locale: z.string(),
})

// Server Functions
// Note: Type errors below are due to TanStack Start type inference issues with pgSchema types

export const getOrCreateGuideShortLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(getOrCreateGuideShortLinkSchema)
  // @ts-expect-error - TanStack Start type inference issue with pgSchema
  .handler(async ({ data }) => getOrCreateGuideShortLink(data.guideNanoId, data.locale))

export const getOrCreateStopShortLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(getOrCreateStopShortLinkSchema)
  // @ts-expect-error - TanStack Start type inference issue with pgSchema
  .handler(async ({ data }) => getOrCreateStopShortLink(data.guideNanoId, data.stopNanoId, data.locale))

export const getShortLinkByCodeFn = createServerFn({ method: 'GET' })
  .inputValidator(getShortLinkByCodeSchema)
  // @ts-expect-error - TanStack Start type inference issue with pgSchema
  .handler(async ({ data }) => getShortLinkByCode(data.code))

export const getShortLinksForGuideFn = createServerFn({ method: 'GET' })
  .inputValidator(getShortLinksForGuideSchema)
  // @ts-expect-error - TanStack Start type inference issue with pgSchema
  .handler(async ({ data }) => getShortLinksForGuide(data.guideNanoId))
