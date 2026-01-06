import { createServerFn } from '@tanstack/react-start'
import { type GetAssetsFilters, getAssets } from '@valguide/core/features/assets/queries'
import { createClient } from '@valguide/supabase/server'
import { z } from 'zod'

const getAssetsInputSchema = z.object({
  type: z.enum(['image', 'audio', 'video']).optional(),
  locale: z.string().optional(),
  organizationId: z.string().optional(),
})

export const getAssetsFn = createServerFn({ method: 'GET' })
  .inputValidator(getAssetsInputSchema)
  .handler(async ({ data }) => {
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const user = claimsData?.claims

    if (!user) {
      throw new Error('Unauthorized')
    }

    const filters: GetAssetsFilters = {}

    if (data.type) {
      filters.type = data.type
    }
    if (data.locale) {
      filters.locale = data.locale
    }
    if (data.organizationId) {
      filters.organizationId = data.organizationId
    }

    const assets = await getAssets(filters)

    return { assets }
  })
