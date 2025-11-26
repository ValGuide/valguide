import { NextResponse } from 'next/server'
import { createClient } from '@valguide/supabase/server'
import { db } from '@valguide/core/features/db'
import { getArchivedGuides } from '@valguide/core/features/guides/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub

    const guides = await getArchivedGuides(db, userId)

    return NextResponse.json({
      guides,
      userId,
    })
  } catch (error) {
    console.error('Failed to fetch archived guides:', error)
    return NextResponse.json({ error: 'Failed to fetch archived guides' }, { status: 500 })
  }
}
