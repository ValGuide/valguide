'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { GuideEditView } from './components/guide-edit-view'
import { StopEditView } from './components/stop-edit-view'

export type GuideEditorClientProps = {
  fallbackGuide: GuideWithStops
  initialSelectedStopId?: string
}

export function GuideEditorClient({ fallbackGuide, initialSelectedStopId }: GuideEditorClientProps) {
  const { guide, mutate } = useGuide(fallbackGuide.nanoId, { fallbackData: fallbackGuide })
  const { data: sidebarData } = useSidebarData()

  const organizationId = sidebarData?.currentTeam?.id

  if (!guide) {
    return null
  }

  const stop = initialSelectedStopId ? guide.stops.find((s) => s.id === initialSelectedStopId) : null

  return (
    <GuideEditorProvider initialGuide={guide} onMutate={mutate}>
      {stop ? (
        <StopEditView stop={stop} organizationId={organizationId} />
      ) : (
        <GuideEditView organizationId={organizationId} />
      )}
    </GuideEditorProvider>
  )
}
