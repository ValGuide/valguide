'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
// biome-ignore lint/style/noRestrictedImports: useSearchParams is only available from next/navigation
import { useSearchParams } from 'next/navigation'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { GuideEditView } from './components/guide-edit-view'
import { StopEditView } from './components/stop-edit-view'

export type GuideEditorClientProps = {
  fallbackGuide: GuideWithStops
}

export function GuideEditorClient({ fallbackGuide }: GuideEditorClientProps) {
  const { guide, mutate } = useGuide(fallbackGuide.nanoId, { fallbackData: fallbackGuide })
  const { data: sidebarData } = useSidebarData()
  const searchParams = useSearchParams()
  const stopId = searchParams.get('stop')

  const organizationId = sidebarData?.currentTeam?.id

  if (!guide) {
    return null
  }

  const stop = stopId ? guide.stops.find((s) => s.id === stopId) : null

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
