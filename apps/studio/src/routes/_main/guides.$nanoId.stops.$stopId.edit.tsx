import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { StopNotFound } from '@/features/guides/components/stop-not-found'
import { guideDetailQueryOptions } from '@/features/guides/query-options'
import { StopEditPage } from '@/features/stops/components/stop-edit-page'
import { StopEditSkeleton } from '@/features/stops/components/stop-edit-skeleton'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { stopDetailQueryOptions, stopLocaleDraftForGuideQueryOptions } from '@/features/stops/query-options'

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

    // Fetch or create the stop locale draft (validated against guide's availableLocales)
    await context.queryClient.ensureQueryData(
      stopLocaleDraftForGuideQueryOptions(params.nanoId, params.stopId, requestedLocale),
    )

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
      <StopEditPage />
    </StopEditorProvider>
  )
}
