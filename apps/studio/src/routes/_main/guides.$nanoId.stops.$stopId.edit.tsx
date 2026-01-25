import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import {
  discardStopTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishStopTranslationFn,
} from '@valguide/core/features/guides/translation/server-functions'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditSkeleton } from '@/features/guides/components/stop-edit-skeleton'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { StopNotFound } from '@/features/guides/components/stop-not-found'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideMetadataQueryOptions } from '@/features/guides/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))

    if (!metadata) {
      throw notFound()
    }

    const stopExists = metadata.stops.some((s) => s.nanoId === params.stopId)
    if (!stopExists) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = metadata

    // Redirect if locale missing or invalid
    if (!requestedLocale || !availableLocales.includes(requestedLocale)) {
      const defaultLocale = availableLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/guides/$nanoId/stops/$stopId/edit',
        params: { nanoId: params.nanoId, stopId: params.stopId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    return { nanoId: params.nanoId, stopId: params.stopId, locale: requestedLocale }
  },
  notFoundComponent: StopNotFound,
  component: GuideStopEditPage,
  pendingComponent: StopEditSkeleton,
})

function GuideStopEditPage() {
  const { nanoId, stopId, locale } = Route.useLoaderData()

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={locale}>
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
