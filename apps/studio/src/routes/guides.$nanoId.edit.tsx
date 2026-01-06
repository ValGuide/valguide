import { createFileRoute, redirect } from '@tanstack/react-router'

import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import { getGuideByNanoIdFn } from '@/features/guides/server-functions'
import { useEffect, useState } from 'react'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/guides/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    stop: search.stop as string | undefined,
    locale: search.locale as string | undefined,
  }),
  loader: async ({ params }) => {
    const guide = await getGuideByNanoIdFn({ data: { nanoId: params.nanoId } })

    if (!guide) {
      throw new Error('Guide not found')
    }

    return { guide }
  },
  component: GuideEditPage,
})

function GuideEditPage() {
  const { guide: fallbackGuide } = Route.useLoaderData()
  const { stop: stopId, locale: editorLocale } = Route.useSearch()
  const { nanoId } = Route.useParams()

  if (stopId) {
    throw redirect({
      to: '/guides/$nanoId/stops/$stopId/edit',
      params: { nanoId, stopId },
    })
  }

  return <GuideEditorClient fallbackGuide={fallbackGuide} initialLocale={editorLocale} />
}

type GuideEditorClientProps = {
  fallbackGuide: GuideWithStopsAndAssets
  initialSelectedStopId?: string
  initialLocale?: string
}

function GuideEditorClient({ fallbackGuide, initialSelectedStopId, initialLocale }: GuideEditorClientProps) {
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
