import { createFileRoute } from '@tanstack/react-router'

import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import { useEffect, useState } from 'react'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { getGuideByNanoIdFn } from '@/features/guides/server-functions'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loader: async ({ params }) => {
    const guide = await getGuideByNanoIdFn({ data: { nanoId: params.nanoId } })

    if (!guide) {
      throw new Error('Guide not found')
    }

    return { guide }
  },
  component: GuideStopEditPage,
})

function GuideStopEditPage() {
  const { guide: fallbackGuide } = Route.useLoaderData()
  const { stopId } = Route.useParams()
  const { locale: editorLocale } = Route.useSearch()

  return <GuideEditorClient fallbackGuide={fallbackGuide} initialSelectedStopId={stopId} initialLocale={editorLocale} />
}

type GuideEditorClientProps = {
  fallbackGuide: GuideWithStopsAndAssets
  initialSelectedStopId?: string
  initialLocale?: string
}

function GuideEditorClient({ fallbackGuide, initialSelectedStopId, initialLocale }: GuideEditorClientProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { guide, mutate } = useGuide(fallbackGuide.nanoId, { initialData: fallbackGuide })
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
