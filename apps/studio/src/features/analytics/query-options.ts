import { queryOptions } from '@tanstack/react-query'
import { type GuideAnalyticsSummary, getGuideAnalyticsFn } from './get-guide-analytics.fn'

export const guideAnalyticsQueryOptions = () =>
  queryOptions<GuideAnalyticsSummary>({
    queryKey: ['guide-analytics'],
    queryFn: () => getGuideAnalyticsFn(),
    staleTime: 60 * 1000,
  })
