'use server'

import { createClient } from '@valguide/core/supabase/server'
import { getProfile } from '@valguide/features/profiles/queries'
import { updateProfile } from '@valguide/features/profiles/mutations'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

const profileSchema = z.object({
  username: z.string().min(3).optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export async function getProfileAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const profile = await getProfile(user.id)
  return profile
}

export async function updateProfileAction(data: ProfileFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('profile.actions')

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate
  const validated = profileSchema.safeParse(data)
  if (!validated.success) {
    return { error: t('invalidData') }
  }

  try {
    await updateProfile(user.id, {
      username: validated.data.username || null,
      firstName: validated.data.firstName || null,
      lastName: validated.data.lastName || null,
    })
    
    revalidatePath('/profile')
    return { success: true, message: t('updateSuccess') }
  } catch (error) {
    console.error('Profile update error:', error)
    return { error: t('updateError') }
  }
}
