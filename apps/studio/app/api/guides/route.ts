import { db } from '@valguide/core/features/db'
import { createGuide, getGuidesByOrganizationId } from '@valguide/core/features/guides/queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { supportedLocales } from '@valguide/i18n/i18n.config'
import { createClient } from '@valguide/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub
    const { searchParams } = new URL(request.url)
    const queryOrganizationId = searchParams.get('organizationId')

    // Get user's teams to verify access and fallback
    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      return NextResponse.json([])
    }

    let targetOrganizationId: string | undefined

    // 1. Try query param (if user is member)
    if (queryOrganizationId) {
      const hasAccess = userTeams.some((t: { id: string }) => t.id === queryOrganizationId)
      if (hasAccess) {
        targetOrganizationId = queryOrganizationId
      }
    }

    // 2. Try cookie
    if (!targetOrganizationId) {
      const cookieStore = await cookies()
      const activeTeamSlug = cookieStore.get('active-team-slug')?.value

      if (activeTeamSlug) {
        const team = userTeams.find((t: { id: string; slug: string }) => t.slug === activeTeamSlug)
        if (team) {
          targetOrganizationId = team.id
        }
      }
    }

    // 3. Fallback to first team
    if (!targetOrganizationId) {
      targetOrganizationId = userTeams[0].id
    }

    // Fetch guides for the specific organization
    // We know targetOrganizationId is defined here because userTeams has at least one item
    const guides = await getGuidesByOrganizationId(db, targetOrganizationId as string)

    return NextResponse.json(guides)
  } catch (error) {
    console.error('Failed to fetch guides:', error)
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub

    // Parse request body
    const body = await request.json()
    let { translations, organizationId } = body

    // If organizationId is not provided, try to find one from the user's memberships
    if (!organizationId) {
      const userTeams = await getUserTeams(db, userId)
      if (userTeams && userTeams.length > 0) {
        // Try to find active team from cookie
        const cookieStore = await cookies()
        const activeTeamSlug = cookieStore.get('active-team-slug')?.value

        if (activeTeamSlug) {
          const team = userTeams.find((t: { id: string; slug: string }) => t.slug === activeTeamSlug)
          if (team) {
            organizationId = team.id
          }
        }

        // Fallback to first team if still not set
        if (!organizationId) {
          organizationId = userTeams[0].id
        }
      }
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization is required to create a guide. Please create an organization first.' },
        { status: 400 },
      )
    }

    // Validate required fields
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json({ error: 'At least one translation is required' }, { status: 400 })
    }

    // Validate translations format
    for (const translation of translations) {
      if (!translation.locale || !translation.title) {
        return NextResponse.json({ error: 'Each translation must have a locale and title' }, { status: 400 })
      }

      if (!supportedLocales.includes(translation.locale)) {
        return NextResponse.json({ error: `Unsupported locale: ${translation.locale}` }, { status: 400 })
      }
    }

    // Create guide in database
    const newGuide = await createGuide(
      db,
      {
        createdBy: userId,
        updatedBy: userId,
        organizationId,
      },
      translations,
    )

    return NextResponse.json(newGuide, { status: 201 })
  } catch (error) {
    console.error('Failed to create guide:', error)
    return NextResponse.json(
      { error: 'Failed to create guide', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
