import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { createTheme, type CreateThemeInput } from '@valguide/core/features/themes/mutations'
import { getOrgThemes } from '@valguide/core/features/themes/queries'
import { createClient } from '@valguide/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub
    const { searchParams } = new URL(request.url)
    const queryOrganizationId = searchParams.get('organizationId')

    const userTeams = await getUserTeams(db, userId)

    if (userTeams.length === 0) {
      return NextResponse.json([])
    }

    let targetOrganizationId: string | undefined

    if (queryOrganizationId) {
      const hasAccess = userTeams.some((t: { id: string }) => t.id === queryOrganizationId)
      if (hasAccess) {
        targetOrganizationId = queryOrganizationId
      }
    }

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

    if (!targetOrganizationId) {
      targetOrganizationId = userTeams[0].id
    }

    const themes = await getOrgThemes(targetOrganizationId as string)

    return NextResponse.json(themes)
  } catch (error) {
    console.error('Failed to fetch themes:', error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub
    const body = await request.json()
    const { organizationId, name, basePreset, colors, radius, fonts } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    if (!basePreset) {
      return NextResponse.json({ error: 'basePreset is required' }, { status: 400 })
    }

    if (!colors) {
      return NextResponse.json({ error: 'colors is required' }, { status: 400 })
    }

    if (radius === undefined || radius === null) {
      return NextResponse.json({ error: 'radius is required' }, { status: 400 })
    }

    if (!fonts) {
      return NextResponse.json({ error: 'fonts is required' }, { status: 400 })
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === organizationId)

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this organization' }, { status: 403 })
    }

    const input: CreateThemeInput = {
      organizationId,
      name: name.trim(),
      basePreset,
      colors,
      radius: Number(radius),
      fonts,
      createdBy: userId,
    }

    const theme = await createTheme(input)

    return NextResponse.json(theme, { status: 201 })
  } catch (error) {
    console.error('Failed to create theme:', error)

    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'A theme with this name already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}
