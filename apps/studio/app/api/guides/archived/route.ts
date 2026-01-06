import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getArchivedGuides } from '@valguide/core/features/guides/queries'
import { createClient } from '@valguide/supabase/server'

export const getArchivedGuidesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error('Unauthorized')
  }

  const userId = claimsData.claims.sub

  const guides = await getArchivedGuides(db, userId)

  return {
    guides,
    userId,
  }
})
