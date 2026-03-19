import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { WorkspaceGeneralTab } from '@/features/team/components/workspace-general-tab'
import { WorkspaceMembersTab } from '@/features/team/components/workspace-members-tab'
import { useTeam } from '@/features/team/hooks/use-team'
import { teamQueryOptions } from '@/features/team/query-options'

export const Route = createFileRoute('/_main/settings')({
  component: SettingsPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(teamQueryOptions()),
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

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
            <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <WorkspaceGeneralTab data={data} onRefetch={refetch} />
          </TabsContent>
          <TabsContent value="members">
            <WorkspaceMembersTab data={data} onRefetch={refetch} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
