'use client'

import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import { useEffect, useState } from 'react'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'
import { GuideEditView } from './components/guide-edit-view'
import { StopEditView } from './components/stop-edit-view'

export type GuideEditorClientProps = {
  fallbackGuide: GuideWithStopsAndAssets
  initialSelectedStopId?: string
  initialLocale?: string
}

export function GuideEditorClient({ fallbackGuide, initialSelectedStopId, initialLocale }: GuideEditorClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { guide, mutate } = useGuide(fallbackGuide.nanoId, { fallbackData: fallbackGuide })
  const { data: sidebarData } = useSidebarData()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const organizationId = sidebarData?.currentTeam?.id

  if (!isMounted || !guide) {
    return null
  }

  const stop = initialSelectedStopId ? guide.stops.find((s) => s.id === initialSelectedStopId) : null

  return (
    <GuideEditorProvider initialGuide={guide} onMutate={mutate} initialLocale={initialLocale}>
      {stop ? (
        <StopEditView stop={stop} organizationId={organizationId} />
      ) : (
        <GuideEditView organizationId={organizationId} />
      )}
    </GuideEditorProvider>
  )
}
