import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { ensureAllStopLocalesForGuideFn } from '@valguide/core/features/guides/stop/locale/ensure-all-stop-locales-for-guide.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { StopNotFound } from '@/features/guides/components/stop-not-found'
import { guideDetailQueryOptions } from '@/features/guides/query-options'
import { StopEditPageConnected } from '@/features/stops/components/stop-edit-page-connected'
import { StopEditSkeleton } from '@/features/stops/components/stop-edit-skeleton'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '@/features/stops/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/stops/$stopId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    // Fetch both guide and stop details to get guide's available locales
    const [guideDetail, stopDetail] = await Promise.all([
      context.queryClient.ensureQueryData(guideDetailQueryOptions(params.nanoId)),
      context.queryClient.ensureQueryData(stopDetailQueryOptions(params.stopId)),
    ])

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    // Use guide's locales for validation (the stop will inherit from guide context)
    const guideLocales = guideDetail.availableLocales

    if (!requestedLocale || !guideLocales.includes(requestedLocale)) {
      const defaultLocale = guideLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/guides/$nanoId/stops/$stopId/edit',
        params: { nanoId: params.nanoId, stopId: params.stopId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    // Pre-create all missing stopLocale + stopLocaleDraft records for guide's locales
    const ensureResult = await ensureAllStopLocalesForGuideFn({
      data: { guideNanoId: params.nanoId, stopNanoId: params.stopId },
    })

    // If new locales were created, invalidate stop detail cache so useEditorBase sees them
    if (ensureResult.createdLocales.length > 0) {
      await context.queryClient.invalidateQueries({ queryKey: ['stop', params.stopId, 'detail'] })
    }

    // Fetch the stop locale draft (records guaranteed to exist after ensure)
    await context.queryClient.ensureQueryData(stopLocaleDraftQueryOptions(params.stopId, requestedLocale))

    return { guideNanoId: params.nanoId, stopNanoId: params.stopId, locale: requestedLocale }
  },
  notFoundComponent: StopNotFound,
  component: GuideStopEditRoute,
  pendingComponent: StopEditSkeleton,
})

function GuideStopEditRoute() {
  const { guideNanoId, stopNanoId, locale } = Route.useLoaderData()
  const t = useTranslations('guides')

  // Get guide's available locales to pass to stop editor
  const { data: guideDetail } = useSuspenseQuery(guideDetailQueryOptions(guideNanoId))

  return (
    <StopEditorProvider
      nanoId={stopNanoId}
      initialLocale={locale}
      guideAvailableLocales={guideDetail.availableLocales}
      navigation={{
        backPath: '/guides/$nanoId/edit',
        backLabel: t('editor.backToGuide'),
        backParams: { nanoId: guideNanoId },
      }}
    >
      <StopEditPageConnected />
    </StopEditorProvider>
  )
}
