import { z } from 'zod'

export const guideTranslationSchema = z.object({
  id: z.string(),
  guideId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const guideSchema = z.object({
  id: z.string(),
  nanoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  author: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  published: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
  translations: z.array(guideTranslationSchema).optional(),
})

export type GuideTranslation = z.infer<typeof guideTranslationSchema>
export type Guide = z.infer<typeof guideSchema>

