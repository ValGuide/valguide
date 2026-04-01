import { identifyStudioUserAnalytics } from '@valguide/core/posthog/PostHogProvider'
import { useEffect } from 'react'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

export function StudioProductAnalytics() {
  const { data } = useSidebarData()

  useEffect(() => {
    if (!data?.user.userId) return

    identifyStudioUserAnalytics({
      distinctId: data.user.userId,
      role: data.currentTeam?.role ?? null,
      organization: data.currentTeam
        ? {
            nanoId: data.currentTeam.nanoId,
            name: data.currentTeam.name,
            slug: data.currentTeam.slug,
            role: data.currentTeam.role,
          }
        : null,
    })
  }, [data])

  return null
}
