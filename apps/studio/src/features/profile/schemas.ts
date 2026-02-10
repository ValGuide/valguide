import { z } from 'zod'

export const profileSchema = z.object({
  username: z.string().min(3).optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>
