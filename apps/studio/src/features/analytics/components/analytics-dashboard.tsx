import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@valguide/core/ui/components/empty'
import { BarChart3 } from 'lucide-react'
import { ListPageHeader } from '@/components/list-page-header'
import type { GuideAnalyticsSummary } from '../get-guide-analytics.server'
import { AnalyticsActivityChart } from './analytics-activity-chart'
import { AnalyticsEventMixChart } from './analytics-event-mix-chart'
import { AnalyticsKpiCard } from './analytics-kpi-card'
import { AnalyticsTourTable } from './analytics-tour-table'

function formatMetric(value: number): string {
  return value.toLocaleString()
}

export function AnalyticsDashboard({
  data,
  description,
  emptyDescription,
  emptyTitle,
  eventMixDescription,
  eventLabels,
  eventMixTitle,
  recentActivityDescription,
  recentActivityTitle,
  tableLabels,
  title,
  tourBreakdownDescription,
  tourBreakdownTitle,
  uniqueVisitorsDescription,
  uniqueVisitorsTitle,
  audioPlaysDescription,
  audioPlaysTitle,
  stopOpensDescription,
  stopOpensTitle,
  tourOpensDescription,
  tourOpensTitle,
}: {
  data: GuideAnalyticsSummary
  description: string
  emptyDescription: string
  emptyTitle: string
  eventMixDescription: string
  eventLabels: {
    tourOpens: string
    stopOpens: string
    audioPlays: string
    events: string
  }
  eventMixTitle: string
  recentActivityDescription: string
  recentActivityTitle: string
  tableLabels: {
    tour: string
    visitors: string
    tourOpens: string
    stopOpens: string
    audioPlays: string
    lastActivity: string
    noActivity: string
  }
  title: string
  tourBreakdownDescription: string
  tourBreakdownTitle: string
  uniqueVisitorsDescription: string
  uniqueVisitorsTitle: string
  audioPlaysDescription: string
  audioPlaysTitle: string
  stopOpensDescription: string
  stopOpensTitle: string
  tourOpensDescription: string
  tourOpensTitle: string
}) {
  const hasEvents = data.eventMix.some((entry) => entry.count > 0)

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto w-full max-w-5xl space-y-6" data-testid="analytics-page">
        <ListPageHeader title={title} description={description} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <AnalyticsKpiCard
            title={uniqueVisitorsTitle}
            description={uniqueVisitorsDescription}
            value={formatMetric(data.totals.uniqueVisitors)}
          />
          <AnalyticsKpiCard
            title={tourOpensTitle}
            description={tourOpensDescription}
            value={formatMetric(data.totals.tourOpens)}
          />
          <AnalyticsKpiCard
            title={stopOpensTitle}
            description={stopOpensDescription}
            value={formatMetric(data.totals.stopOpens)}
          />
          <AnalyticsKpiCard
            title={audioPlaysTitle}
            description={audioPlaysDescription}
            value={formatMetric(data.totals.audioPlays)}
          />
        </div>

        {hasEvents ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
              <AnalyticsActivityChart
                data={data.recentActivity}
                title={recentActivityTitle}
                description={recentActivityDescription}
                labels={eventLabels}
              />
              <AnalyticsEventMixChart
                data={data.eventMix}
                title={eventMixTitle}
                description={eventMixDescription}
                labels={eventLabels}
              />
            </div>
            <AnalyticsTourTable
              data={data.tours}
              title={tourBreakdownTitle}
              description={tourBreakdownDescription}
              labels={tableLabels}
            />
          </>
        ) : (
          <Empty className="rounded-3xl border border-dashed bg-muted/20 py-20">
            <EmptyMedia variant="icon" className="bg-background shadow-xs">
              <BarChart3 className="size-5" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription className="max-w-md">{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </main>
  )
}
