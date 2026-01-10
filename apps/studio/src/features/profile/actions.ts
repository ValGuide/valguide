import { createServerFn } from '@tanstack/react-start'

import { createClient } from '@valguide/core/supabase/server'
import { updateProfile } from '@valguide/features/profiles/mutations'
import { profileSchema } from './schemas'

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(profileSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims

    if (!user) {
      throw new Error('Unauthorized')
    }

    const validated = profileSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, validationError: true }
    }

    try {
      await updateProfile(user.sub, {
        username: validated.data.username || null,
        firstName: validated.data.firstName || null,
        lastName: validated.data.lastName || null,
      })

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false }
    }
  })
