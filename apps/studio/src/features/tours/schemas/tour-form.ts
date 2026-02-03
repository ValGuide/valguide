import { z } from 'zod'

export const tourTranslationFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
})

export type TourTranslationFormData = z.infer<typeof tourTranslationFormSchema>

export const stopTranslationFormSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  transcription: z.string(),
})

export type StopTranslationFormData = z.infer<typeof stopTranslationFormSchema>
