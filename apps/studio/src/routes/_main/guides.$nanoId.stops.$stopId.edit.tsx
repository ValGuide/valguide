import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { publishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/publish-stop-locale'
import { rollbackStopLocaleFn } from '@valguide/core/features/guides/stop/locale/rollback-stop-locale'
import { unpublishStopLocaleFn } from '@valguide/core/features/guides/stop/locale/unpublish-stop-locale'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { StopEditSkeleton } from '@/features/guides/components/stop-edit-skeleton'
import { StopEditView } from '@/features/guides/components/stop-edit-view'
import { StopNotFound } from '@/features/guides/components/stop-not-found'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideDetailQueryOptions, guideStructureDraftQueryOptions } from '@/features/guides/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const [guideDetail, structure] = await Promise.all([
      context.queryClient.ensureQueryData(guideDetailQueryOptions(params.nanoId)),
      context.queryClient.ensureQueryData(guideStructureDraftQueryOptions(params.nanoId, deps.locale ?? 'en')),
    ])

    if (!guideDetail) {
      throw notFound()
    }

    const stopExists = structure?.stops.some((s) => s.stopNanoId === params.stopId)
    if (!stopExists) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = guideDetail

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
      <StopEditContent stopNanoId={stopId} />
    </GuideEditorProvider>
  )
}

function StopEditContent({ stopNanoId }: { stopNanoId: string }) {
  const { guideDetail } = useGuideEditor()

  if (!guideDetail) {
    return <StopEditSkeleton />
  }

  return (
    <StopEditView
      stopNanoId={stopNanoId}
      MediaPicker={MediaPickerConnected}
      onPublish={(nanoId, locale) => publishStopLocaleFn({ data: { nanoId, locale } })}
      onUnpublish={(nanoId, locale) => unpublishStopLocaleFn({ data: { nanoId, locale } })}
      onDiscard={(nanoId, locale) => rollbackStopLocaleFn({ data: { nanoId, locale } })}
    />
  )
}
