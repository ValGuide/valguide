import { createServerFn } from '@tanstack/react-start'
import { db } from '@valguide/core/features/db'
import { getGuideByNanoIdWithAssets } from '@valguide/core/features/guides/queries'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'

const getGuideByNanoIdInputSchema = z.object({
  nanoId: z.string(),
})

export const getGuideByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getGuideByNanoIdInputSchema)
  .handler(async ({ data }) => {
    const { nanoId } = data

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error('Unauthorized')
    }

    const guide = await getGuideByNanoIdWithAssets(db, nanoId)

    if (!guide) {
      throw new Error('Not found')
    }

    return guide
  })
