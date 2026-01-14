import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@valguide/core/supabase/server'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'
import { getProfile } from '@valguide/features/profiles/queries'

export const getProfileFn = createServerFn({ method: 'GET' }).handler(
  handleError(async () => {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const userId = claimsData.claims.sub
    const profile = await getProfile(userId)

    if (!profile) {
      return null
    }

    return profile
  }),
)
