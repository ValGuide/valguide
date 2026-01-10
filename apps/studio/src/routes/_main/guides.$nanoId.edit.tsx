import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  discardStopTranslationDraftFn,
  publishGuideTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishGuideTranslationFn,
  unpublishStopTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/types'
import { useEffect, useState } from 'react'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuide } from '@/features/guides/hooks/use-guide'
import { guideQueryOptions } from '@/features/guides/query-options'
import { useSidebarData } from '@/features/sidebar/hooks/use-sidebar-data'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    stop: search.stop as string | undefined,
    locale: search.locale as string | undefined,
  }),
  loader: async ({ params, context }) => {
    const guide = await context.queryClient.ensureQueryData(guideQueryOptions(params.nanoId))

    if (!guide) {
      throw new Error('Guide not found')
    }

    return { guide }
  },
  component: GuideEditPage,
  pendingComponent: GuideEditSkeleton,
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
        <StopEditView
          stop={stop}
          organizationId={organizationId}
          MediaPicker={MediaPickerConnected}
          onPublish={(stopId, locale) => publishStopTranslationDraftFn({ data: { stopId, locale } })}
          onUnpublish={(stopId, locale) => unpublishStopTranslationFn({ data: { stopId, locale } })}
          onDiscard={(stopId, locale) => discardStopTranslationDraftFn({ data: { stopId, locale } })}
        />
      ) : (
        <GuideEditView
          organizationId={organizationId}
          onPublish={(guideId, locale) => publishGuideTranslationDraftFn({ data: { guideId, locale } })}
          onUnpublish={(guideId, locale) => unpublishGuideTranslationFn({ data: { guideId, locale } })}
          onDiscard={(guideId, locale) => discardGuideTranslationDraftFn({ data: { guideId, locale } })}
          MediaPicker={MediaPickerConnected}
        />
      )}
    </GuideEditorProvider>
  )
}
