import { db } from '@valguide/core/features/db'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
import { deleteTheme, updateTheme, type UpdateThemeInput } from '@valguide/core/features/themes/mutations'
import { getFullThemeById } from '@valguide/core/features/themes/queries'
import { createClient } from '@valguide/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub

    const theme = await getFullThemeById(id)

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === theme.organizationId)

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this theme' }, { status: 403 })
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Failed to fetch theme:', error)
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub

    const existingTheme = await getFullThemeById(id)

    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === existingTheme.organizationId)

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this theme' }, { status: 403 })
    }

    const body = await request.json()
    const { name, basePreset, colors, radius, fonts } = body

    const input: UpdateThemeInput = { id }

    if (name !== undefined) input.name = name.trim()
    if (basePreset !== undefined) input.basePreset = basePreset
    if (colors !== undefined) input.colors = colors
    if (radius !== undefined) input.radius = Number(radius)
    if (fonts !== undefined) input.fonts = fonts

    const updated = await updateTheme(input)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update theme:', error)

    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'A theme with this name already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = claimsData.claims.sub

    const existingTheme = await getFullThemeById(id)

    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }

    const userTeams = await getUserTeams(db, userId)
    const hasAccess = userTeams.some((t: { id: string }) => t.id === existingTheme.organizationId)

    if (!hasAccess) {
      return NextResponse.json({ error: 'You do not have access to this theme' }, { status: 403 })
    }

    await deleteTheme(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete theme:', error)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}
