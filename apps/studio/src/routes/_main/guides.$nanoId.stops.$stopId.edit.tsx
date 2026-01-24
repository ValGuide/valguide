import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditSkeleton } from '@/features/guides/components/stop-edit-skeleton'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { StopNotFound } from '@/features/guides/components/stop-not-found'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideMetadataQueryOptions } from '@/features/guides/query-options'
import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  discardStopTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishStopTranslationFn,
} from '@valguide/core/features/guides/server-functions'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loader: async ({ params, context }) => {
    const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))
    if (metadata) {
      const stopExists = metadata.stops.some((s) => s.nanoId === params.stopId)
      if (!stopExists) {
        throw notFound()
      }
    }
    return { nanoId: params.nanoId, stopId: params.stopId }
  },
  notFoundComponent: StopNotFound,
  component: GuideStopEditPage,
  pendingComponent: StopEditSkeleton,
})

function GuideStopEditPage() {
  const { nanoId, stopId } = Route.useLoaderData()
  const { locale } = Route.useSearch()

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={locale!}>
      <StopEditContent stopId={stopId} />
    </GuideEditorProvider>
  )
}

function StopEditContent({ stopId }: { stopId: string }) {
  const { metadata } = useGuideEditor()

  if (!metadata) {
    return <StopEditSkeleton />
  }

  return (
    <StopEditView
      stopId={stopId}
      MediaPicker={MediaPickerConnected}
      onPublish={(stopId, locale) => publishStopTranslationDraftFn({ data: { stopId, locale } })}
      onUnpublish={(stopId, locale) => unpublishStopTranslationFn({ data: { stopId, locale } })}
      onDiscard={(stopId, locale) => discardStopTranslationDraftFn({ data: { stopId, locale } })}
    />
  )
}
