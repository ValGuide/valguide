import { z } from 'zod'

export const guideTranslationFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
})

export type GuideTranslationFormData = z.infer<typeof guideTranslationFormSchema>

export const stopTranslationFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  transcription: z.string(),
})

export type StopTranslationFormData = z.infer<typeof stopTranslationFormSchema>
