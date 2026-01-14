import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'
import { themesQueryOptions } from '@/features/design/query-options'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { sidebarQueryOptions } from '@/features/sidebar/query-options'

export const Route = createFileRoute('/_main/design')({
  loader: async ({ context }) => {
    const sidebarData = await context.queryClient.ensureQueryData(sidebarQueryOptions())
    if (sidebarData?.currentTeam?.id) {
      await context.queryClient.ensureQueryData(themesQueryOptions(sidebarData.currentTeam.id))
    }
    return { sidebarData }
  },
  component: DesignPage,
  pendingComponent: DesignPageSkeleton,
})

function DesignPage() {
  const t = useTranslations('sidebar')
  const { data: sidebarData, isLoading: isSidebarLoading } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id

  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 pt-0">
      <div className="mb-6 space-y-1">
        <PageTitle as="h2">{t('nav.design')}</PageTitle>
        <p className="text-sm text-muted-foreground">{t('pages.design.description')}</p>
      </div>
      <div className="flex-1 min-h-0">
        {isSidebarLoading || !organizationId ? (
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.8fr)] gap-6 w-full flex-1 min-h-0">
            <Skeleton className="h-[500px] rounded-lg" />
            <Skeleton className="h-[500px] rounded-lg" />
          </div>
        ) : (
          <ThemeCustomizerContainer organizationId={organizationId} />
        )}
      </div>
    </main>
  )
}
