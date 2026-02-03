import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { ensureAllStopLocalesForTourFn } from '@valguide/core/features/tours/stop/locale/ensure-all-stop-locales-for-tour.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { StopNotFound } from '@/features/tours/components/stop-not-found'
import { tourDetailQueryOptions } from '@/features/tours/query-options'
import { StopEditPageConnected } from '@/features/stops/components/stop-edit-page-connected'
import { StopEditSkeleton } from '@/features/stops/components/stop-edit-skeleton'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '@/features/stops/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/tours/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    // Fetch both tour and stop details to get tour's available locales
    const [tourDetail, stopDetail] = await Promise.all([
      context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId)),
      context.queryClient.ensureQueryData(stopDetailQueryOptions(params.stopId)),
    ])

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    // Use tour's locales for validation (the stop will inherit from tour context)
    const tourLocales = tourDetail.availableLocales

    if (!requestedLocale || !tourLocales.includes(requestedLocale)) {
      const defaultLocale = tourLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/tours/$nanoId/stops/$stopId/edit',
        params: { nanoId: params.nanoId, stopId: params.stopId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    // Pre-create all missing stopLocale + stopLocaleDraft records for tour's locales
    const ensureResult = await ensureAllStopLocalesForTourFn({
      data: { tourNanoId: params.nanoId, stopNanoId: params.stopId },
    })

    // If new locales were created, invalidate stop detail cache so useEditorBase sees them
    if (ensureResult.createdLocales.length > 0) {
      await context.queryClient.invalidateQueries({ queryKey: ['stop', params.stopId, 'detail'] })
    }

    // Fetch the stop locale draft (records guaranteed to exist after ensure)
    await context.queryClient.ensureQueryData(stopLocaleDraftQueryOptions(params.stopId, requestedLocale))

    return { tourNanoId: params.nanoId, stopNanoId: params.stopId, locale: requestedLocale }
  },
  notFoundComponent: StopNotFound,
  component: TourStopEditRoute,
  pendingComponent: StopEditSkeleton,
})

function TourStopEditRoute() {
  const { tourNanoId, stopNanoId, locale } = Route.useLoaderData()
  const t = useTranslations('tours')

  // Get tour's available locales to pass to stop editor
  const { data: tourDetail } = useSuspenseQuery(tourDetailQueryOptions(tourNanoId))

  return (
    <StopEditorProvider
      nanoId={stopNanoId}
      initialLocale={locale}
      tourAvailableLocales={tourDetail.availableLocales}
      navigation={{
        backPath: '/tours/$nanoId/edit',
        backLabel: t('editor.backToTour'),
        backParams: { nanoId: tourNanoId },
      }}
    >
      <StopEditPageConnected />
    </StopEditorProvider>
  )
}
