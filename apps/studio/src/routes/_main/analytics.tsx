import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { useTranslations } from '@valguide/core/i18n/client'
import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard'
import { guideAnalyticsQueryOptions } from '@/features/analytics/query-options'

export const Route = createFileRoute('/_main/analytics')({
  loader: ({ context }) => context.queryClient.ensureQueryData(guideAnalyticsQueryOptions()),
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { data } = useSuspenseQuery(guideAnalyticsQueryOptions())
  const t = useTranslations('sidebar.pages.analytics')

  return (
    <AnalyticsDashboard
      data={data}
      title={t('title')}
      description={t('description')}
      uniqueVisitorsTitle={t('kpis.uniqueVisitors.title')}
      uniqueVisitorsDescription={t('kpis.uniqueVisitors.description')}
      tourOpensTitle={t('kpis.tourOpens.title')}
      tourOpensDescription={t('kpis.tourOpens.description')}
      stopOpensTitle={t('kpis.stopOpens.title')}
      stopOpensDescription={t('kpis.stopOpens.description')}
      audioPlaysTitle={t('kpis.audioPlays.title')}
      audioPlaysDescription={t('kpis.audioPlays.description')}
      recentActivityTitle={t('recentActivity.title')}
      recentActivityDescription={t('recentActivity.description')}
      eventMixTitle={t('eventMix.title')}
      eventMixDescription={t('eventMix.description')}
      eventLabels={{
        tourOpens: t('eventLabels.tourOpens'),
        stopOpens: t('eventLabels.stopOpens'),
        audioPlays: t('eventLabels.audioPlays'),
        events: t('eventLabels.events'),
      }}
      tourBreakdownTitle={t('tourBreakdown.title')}
      tourBreakdownDescription={t('tourBreakdown.description')}
      tableLabels={{
        tour: t('table.tour'),
        visitors: t('table.visitors'),
        tourOpens: t('table.tourOpens'),
        stopOpens: t('table.stopOpens'),
        audioPlays: t('table.audioPlays'),
        lastActivity: t('table.lastActivity'),
        noActivity: t('table.noActivity'),
      }}
      emptyTitle={t('empty.title')}
      emptyDescription={t('empty.description')}
    />
  )
}
