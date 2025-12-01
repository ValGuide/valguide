import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import { toGuideWithStops } from '@valguide/core/features/guides/schema'
import { createClient } from '@valguide/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ nanoId: string }> }) {
  const { nanoId } = await params

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims?.sub) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const guideData = await getGuideByNanoId(db, nanoId)

  if (!guideData) {
    return new NextResponse('Not found', { status: 404 })
  }

  const guide = toGuideWithStops(guideData)

  return NextResponse.json(guide)
}
