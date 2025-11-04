import { z } from 'zod'

export const guideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  tags: z.array(z.string()).optional(),
})

export type Guide = z.infer<typeof guideSchema>
