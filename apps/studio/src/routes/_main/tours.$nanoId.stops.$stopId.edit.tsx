import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { createStopFn } from '@valguide/core/features/tours/stop/create-stop.fn'
import { ensureAllStopLocalesForTourFn } from '@valguide/core/features/tours/stop/locale/ensure-all-stop-locales-for-tour.fn'
import { addStopToTourFn } from '@valguide/core/features/tours/structure/add-stop.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { z } from 'zod'
import { StopEditPageConnected } from '@/features/stops/components/stop-edit-page-connected'
import { StopEditSkeleton } from '@/features/stops/components/stop-edit-skeleton'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '@/features/stops/query-options'
import { StopNotFound } from '@/features/tours/components/stop-not-found'
import { tourDetailQueryOptions } from '@/features/tours/query-options'

const searchSchema = z.object({
  locale: z.string().optional(),
  new: z.boolean().optional(),
})

export const Route = createFileRoute('/_main/tours/$nanoId/stops/$stopId/edit')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ locale: search.locale, isNew: search.new }),
  loader: async ({ params, context, deps }) => {
    const tourDetail = await context.queryClient.ensureQueryData(tourDetailQueryOptions(params.nanoId))

    const stopDetail = await context.queryClient
      .ensureQueryData(stopDetailQueryOptions(params.stopId))
      .catch(() => null)

    if (!stopDetail && deps.isNew) {
      const locale = deps.locale ?? tourDetail.availableLocales[0] ?? 'en'
      await createStopFn({ data: { nanoId: params.stopId, locale } })
      await addStopToTourFn({ data: { tourNanoId: params.nanoId, stopNanoId: params.stopId } })
      await context.queryClient.invalidateQueries({ queryKey: ['tour', params.nanoId, 'structure'] })

      throw redirect({
        to: '/tours/$nanoId/stops/$stopId/edit',
        params: { nanoId: params.nanoId, stopId: params.stopId },
        search: { locale },
        replace: true,
      })
    }

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
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

    const ensureResult = await ensureAllStopLocalesForTourFn({
      data: { tourNanoId: params.nanoId, stopNanoId: params.stopId },
    })

    if (ensureResult.createdLocales.length > 0) {
      await context.queryClient.invalidateQueries({ queryKey: ['stop', params.stopId, 'detail'] })
    }

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
