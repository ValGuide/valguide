import {
  type GuideAnalyticsSummary,
  getGuideAnalytics,
} from '@valguide/core/features/analytics/get-guide-analytics.server'

export type { GuideAnalyticsSummary } from '@valguide/core/features/analytics/get-guide-analytics.server'

export async function getOrganizationGuideAnalytics(organizationId: string): Promise<GuideAnalyticsSummary> {
  return getGuideAnalytics(organizationId)
}
