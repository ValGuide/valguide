import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
import { SettingsPageSkeleton } from '@/features/team/components/settings-page-skeleton'
import { WorkspaceGeneralSectionConnected } from '@/features/team/components/workspace-general-section-connected'
import { WorkspaceMembersSectionConnected } from '@/features/team/components/workspace-members-section-connected'
import { useTeam } from '@/features/team/hooks/use-team'
import { teamQueryOptions } from '@/features/team/query-options'

export const Route = createFileRoute('/_main/settings')({
  component: SettingsPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions()),
  pendingComponent: SettingsPageSkeleton,
})

function SettingsPage() {
  const t = useTranslations('orgs.teamSettings')
  const { data, refetch } = useTeam()

  return (
    <main data-testid="settings-page" className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>

        <div className="space-y-6">
          <WorkspaceGeneralSectionConnected data={data} onRefetch={refetch} />
          <WorkspaceMembersSectionConnected data={data} onRefetch={refetch} />
        </div>
      </div>
    </main>
  )
}
