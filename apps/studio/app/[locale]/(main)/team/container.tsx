'use client'

import { useEffect, useState } from 'react'
import { getTeamDataAction } from '@valguide/core/features/orgs/data-actions'
import { TeamMembersClient } from './client'
import { type Team } from '@valguide/core/features/orgs/components/team-switcher'
import { type TeamMember, type OrgRole } from '@valguide/core/features/orgs/components/members-table'
import { type PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

import { TeamPageSkeleton } from '@valguide/core/features/orgs/components/team-page-skeleton'

export function TeamPageContainer() {
  const router = useRouter()
  const locale = useLocale()
  const [data, setData] = useState<{
    team: any
    members: TeamMember[]
    pendingInvites: PendingInvitation[]
    currentUserRole: OrgRole
    currentUserId: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeamDataAction().then((res) => {
      if (!res) {
        // Redirect to login or home if no team context
        // We can't easily know why res is null (unauth vs no team), but safe fallback is redirect
        // But since we are in a client component, we can do client navigation
        // However, we don't want to infinite loop.
        // Layout handles unauth via Sidebar check? No, sidebar check just returns null.
        // We should probably redirect to login if we can't get data.
        // For now, just stop loading.
        setLoading(false)
        return
      }
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <TeamPageSkeleton />
  }

  if (!data) {
    // If data fetch failed but we are here, maybe redirect to login?
    // router.push(`/${locale}/login`)
    return null 
  }

  return (
    <TeamMembersClient
      team={data.team}
      members={data.members}
      pendingInvites={data.pendingInvites}
      currentUserRole={data.currentUserRole}
      currentUserId={data.currentUserId}
    />
  )
}
