import { z } from 'zod'
import type { Asset } from '../assets/types'
import type { GuideWithStops, GuideWithTranslations, StopWithTranslations } from './schema-types'

// Extended types for app viewer (moved from queries.ts to avoid db.ts import in Storybook)
export type AssetWithRole = Asset & {
  guideAssetId?: string
  stopAssetId?: string
  role: string
  order: number
  locale?: string | null
}

export type StopWithAssets = StopWithTranslations & {
  assets: AssetWithRole[]
}

export type GuideWithStopsAndAssets = Omit<GuideWithStops, 'stops'> & {
  assets: AssetWithRole[]
  stops: StopWithAssets[]
}

export type GuideWithTranslationsAndCover = GuideWithTranslations & {
  coverImage?: AssetWithRole | null
}

export const guideTranslationSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const coverImageSchema = z
  .object({
    storagePath: z.string(),
    publicUrl: z.string().nullable().optional(),
  })
  .nullable()
  .optional()

export const guideSchema = z.object({
  id: z.string(),
  nanoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  coverImage: coverImageSchema,
  author: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  published: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
  translations: z.array(guideTranslationSchema).optional(),
})

export type GuideTranslation = z.infer<typeof guideTranslationSchema>
export type Guide = z.infer<typeof guideSchema>
