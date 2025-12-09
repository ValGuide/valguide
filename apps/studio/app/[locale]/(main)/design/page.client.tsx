'use client'

import { Skeleton } from '@valguide/ui/components/skeleton'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { useTranslations } from 'next-intl'
import { ThemeCustomizerContainer } from '../../../../features/design/components/theme-customizer-container'

export function DesignPageClient() {
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
          <div className="flex gap-6">
            <Skeleton className="h-[400px] w-[280px]" />
            <Skeleton className="h-[400px] w-[360px]" />
            <Skeleton className="h-[400px] flex-1" />
          </div>
        ) : (
          <ThemeCustomizerContainer organizationId={organizationId} />
        )}
      </div>
    </main>
  )
}
