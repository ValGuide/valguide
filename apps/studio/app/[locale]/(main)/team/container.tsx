'use client'

import { type OrgRole, type TeamMember } from '@valguide/core/features/orgs/components/members-table'
import { type PendingInvitation } from '@valguide/core/features/orgs/components/pending-invites-list'
import { getTeamDataAction } from '@valguide/core/features/orgs/data-actions'
import { getSidebarDataAction } from '@valguide/core/features/orgs/context-actions'
import { useEffect, useState } from 'react'
import { TeamMembersClient } from './client'
import { Button } from '@valguide/ui/components/button'
import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'

import { TeamPageSkeleton } from '@valguide/core/features/orgs/components/team-page-skeleton'
import { useTranslations } from 'next-intl'

export function TeamPageContainer() {
  const t = useTranslations('orgs.noTeam')
  const [data, setData] = useState<{
    team: any
    members: TeamMember[]
    pendingInvites: PendingInvitation[]
    currentUserRole: OrgRole
    currentUserId: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNoTeam, setIsNoTeam] = useState(false)

  const loadData = async () => {
    const res = await getTeamDataAction()
    if (res) {
      setData(res)
      setLoading(false)
      return
    }

    // If no team data, check if user is authenticated
    const sidebarRes = await getSidebarDataAction()
    if (sidebarRes && sidebarRes.user) {
      setIsNoTeam(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <TeamPageSkeleton />
  }

  if (isNoTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">{t('welcome')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <CreateTeamDialog>
          <Button size="lg">{t('createButton')}</Button>
        </CreateTeamDialog>
      </div>
    )
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
      onAction={loadData}
    />
  )
}
