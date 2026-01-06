import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/core/supabase/server'
import { updateProfile } from '@valguide/features/profiles/mutations'
import { getTranslations } from '@valguide/core/i18n/mock-server'
import { z } from 'zod'

const profileSchema = z.object({
  username: z.string().min(3).optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(profileSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims
    const t = await getTranslations('profile.actions')

    if (!user) {
      throw new Error('Unauthorized')
    }

    const validated = profileSchema.safeParse(data)
    if (!validated.success) {
      return { error: t('invalidData') }
    }

    try {
      await updateProfile(user.sub, {
        username: validated.data.username || null,
        firstName: validated.data.firstName || null,
        lastName: validated.data.lastName || null,
      })

      return { success: true, message: t('updateSuccess') }
    } catch (error) {
      console.error('Profile update error:', error)
      return { error: t('updateError') }
    }
  })
