import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/mock'
import { Skeleton } from '@valguide/ui/components/skeleton'
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
})

function DesignPage() {
  const t = useTranslations('sidebar')
  const { data: sidebarData, isLoading: isSidebarLoading } = useSidebarData()
  const organizationId = sidebarData?.currentTeam?.id

  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('nav.design')}</h1>
        <p className="text-muted-foreground mt-1">{t('pages.design.description')}</p>
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
