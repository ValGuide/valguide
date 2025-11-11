import { NextRequest, NextResponse } from 'next/server'
import { getAssets, type GetAssetsFilters } from '@valguide/core/features/assets/queries'
import { createClient } from '@valguide/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as GetAssetsFilters['type'] | null
    const locale = searchParams.get('locale') || undefined
    const organizationId = searchParams.get('organizationId') || undefined

    const filters: GetAssetsFilters = {}

    if (type && (type === 'image' || type === 'audio' || type === 'video')) {
      filters.type = type
    }
    if (locale) {
      filters.locale = locale
    }
    if (organizationId) {
      filters.organizationId = organizationId
    }

    const assets = await getAssets(filters)

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}
