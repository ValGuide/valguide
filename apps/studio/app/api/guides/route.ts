import { NextResponse } from 'next/server'
import { createClient } from '@valguide/supabase/server'
import { db } from '@valguide/core/features/db'
import { createGuide, getGuidesByUserId } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { supportedLocales } from '@valguide/i18n/i18n.config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = claimsData.claims.sub

    // Fetch guides from database
    const guides = await getGuidesByUserId(db, userId)

    return NextResponse.json(guides)
  } catch (error) {
    console.error('Failed to fetch guides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = claimsData.claims.sub

    // Parse request body
    const body = await request.json()
    let { translations, organizationId, coverImage } = body

    // If organizationId is not provided, try to find one from the user's memberships
    if (!organizationId) {
      const userTeams = await getUserTeams(db, userId)
      if (userTeams && userTeams.length > 0) {
        organizationId = userTeams[0].id
      }
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization is required to create a guide. Please create an organization first.' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { error: 'At least one translation is required' },
        { status: 400 }
      )
    }

    // Validate translations format
    for (const translation of translations) {
      if (!translation.locale || !translation.title) {
        return NextResponse.json(
          { error: 'Each translation must have a locale and title' },
          { status: 400 }
        )
      }

      if (!supportedLocales.includes(translation.locale)) {
        return NextResponse.json(
          { error: `Unsupported locale: ${translation.locale}` },
          { status: 400 }
        )
      }
    }

    // Create guide in database
    const newGuide = await createGuide(
      db,
      {
        createdBy: userId,
        updatedBy: userId,
        organizationId,
        coverImage: coverImage || null,
      },
      translations
    )

    return NextResponse.json(newGuide, { status: 201 })
  } catch (error) {
    console.error('Failed to create guide:', error)
    return NextResponse.json(
      { error: 'Failed to create guide', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

