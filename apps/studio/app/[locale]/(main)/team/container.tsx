'use client'

import { TeamMembersClient } from './client'
import { Button } from '@valguide/ui/components/button'
import { CreateTeamDialog } from '@valguide/core/features/orgs/components/create-team-dialog'
import { TeamPageSkeleton } from '@valguide/core/features/orgs/components/team-page-skeleton'
import { useTranslations } from 'next-intl'
import { useTeam } from '../../../../features/team/hooks/use-team'

export function TeamPageContainer() {
  const t = useTranslations('orgs.noTeam')
  const { data, isLoading, isNoTeam, refetch } = useTeam()

  if (isLoading) {
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
    return null
  }

  return (
    <TeamMembersClient
      team={data.team}
      members={data.members}
      pendingInvites={data.pendingInvites}
      currentUserRole={data.currentUserRole}
      currentUserId={data.currentUserId}
      onAction={refetch}
    />
  )
}
