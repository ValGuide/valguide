import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { updateStopVisibilityFn } from '@valguide/core/features/tours/structure/update-stop-visibility.fn'
import { discardAllTourChangesFn } from '@valguide/core/features/tours/tour/discard-all-tour-changes.fn'
import { unpublishTourLocaleFn } from '@valguide/core/features/tours/tour/locale/unpublish-tour-locale.fn'
import { publishTourFn } from '@valguide/core/features/tours/tour/publish-tour.fn'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { TourQrPanelConnected } from '@/features/qr/components/tour-qr-panel-connected'
import { tourQrCodeQueryOptions } from '@/features/qr/query-options'
import { TourEditPage } from '@/features/tours/components/tour-edit-page'
import { TourEditSkeleton } from '@/features/tours/components/tour-edit-skeleton'
import { TourNotFound } from '@/features/tours/components/tour-not-found'
import { TourEditorProvider } from '@/features/tours/contexts/tour-editor-context'
import { useTourEditor } from '@/features/tours/contexts/tour-editor-types'
import {
  tourDetailQueryOptions,
  tourLocaleDiffQueryOptions,
  tourLocaleDraftQueryOptions,
} from '@/features/tours/query-options'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/_main/tours/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    stop: search.stop as string | undefined,
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const tourDetail = await context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId))

    if (!tourDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = tourDetail

    if (!requestedLocale || !availableLocales.includes(requestedLocale)) {
      const defaultLocale = availableLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/tours/$nanoId/edit',
        params: { nanoId: params.nanoId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    await Promise.all([
      context.queryClient.ensureQueryData(tourLocaleDraftQueryOptions(params.nanoId, requestedLocale)),
      context.queryClient.ensureQueryData(tourQrCodeQueryOptions(params.nanoId)),
    ])

    return { nanoId: params.nanoId, locale: requestedLocale }
  },
  component: TourEditRoute,
  pendingComponent: TourEditSkeleton,
  notFoundComponent: TourNotFound,
})

function TourEditRoute() {
  const { nanoId, locale } = Route.useLoaderData()

  return (
    <TourEditorProvider nanoId={nanoId} initialLocale={locale}>
      <TourEditPageContent />
    </TourEditorProvider>
  )
}

function TourEditPageContent() {
  const { nanoId, activeLocale } = useTourEditor()

  const handlePublish = async (_tourId: string, locale: string) => {
    // Unified publish: tour locale + structure + settings + assets + all stop translations
    await publishTourFn({ data: { nanoId, locale } })
  }

  return (
    <TourEditPage
      onPublish={handlePublish}
      onUnpublish={(_tourId, locale) => unpublishTourLocaleFn({ data: { nanoId, locale } })}
      onDiscard={(_tourId, locale) => discardAllTourChangesFn({ data: { nanoId, locale } })}
      onHideStop={(_tourId, stopNanoId) =>
        updateStopVisibilityFn({ data: { tourNanoId: nanoId, stopNanoId, visible: false } })
      }
      onShowStop={(_tourId, stopNanoId) =>
        updateStopVisibilityFn({ data: { tourNanoId: nanoId, stopNanoId, visible: true } })
      }
      MediaPicker={MediaPickerConnected}
      TourQrPanel={TourQrPanelConnected}
      diffQueryOptions={tourLocaleDiffQueryOptions(nanoId, activeLocale)}
    />
  )
}
