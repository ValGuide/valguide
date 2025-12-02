import { db } from '@valguide/core/features/db'
import { getStopsByOrganizationId } from '@valguide/core/features/guides/stop-queries'
import { getUserTeams } from '@valguide/core/features/orgs/queries'
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

    const stops = await getStopsByOrganizationId(targetOrganizationId as string)

    return NextResponse.json(stops)
  } catch (error) {
    console.error('Failed to fetch stops:', error)
    return NextResponse.json({ error: 'Failed to fetch stops' }, { status: 500 })
  }
}
