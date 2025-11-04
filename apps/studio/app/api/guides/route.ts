import { NextResponse } from 'next/server'
import { Guide } from '@valguide/features/guides/types'
import { createClient } from '@valguide/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data,
    } = await supabase.auth.getClaims()

    if (!data) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Fetch guides from database
    // Example with Drizzle ORM:
    // import { db } from '@valguide/core/features/db'
    // import { guides } from '@valguide/core/features/schema'
    // const data = await db.select().from(guides).where(eq(guides.userId, session.user.id))

    // For now, return empty array
    const guides: Guide[] = []

    return NextResponse.json(guides)
  } catch (error) {
    console.error('Failed to fetch guides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    )
  }
}

