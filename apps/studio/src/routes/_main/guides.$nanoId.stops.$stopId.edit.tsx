import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Loader2 } from 'lucide-react'
import { StopEditPage } from '@/features/stops/components/stop-edit-page'
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
    const stopDetail = await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.stopId))

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = stopDetail

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

    await context.queryClient.ensureQueryData(stopLocaleDraftQueryOptions(params.stopId, requestedLocale))

    return { guideNanoId: params.nanoId, stopNanoId: params.stopId, locale: requestedLocale }
  },
  notFoundComponent: StopNotFound,
  component: GuideStopEditPage,
  pendingComponent: StopEditSkeleton,
})

function StopEditSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function StopNotFound() {
  const t = useTranslations('stops')
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('notFound.description')}</p>
      </div>
    </div>
  )
}

function GuideStopEditPage() {
  const { guideNanoId, stopNanoId, locale } = Route.useLoaderData()
  const t = useTranslations('guides')

  return (
    <StopEditorProvider
      nanoId={stopNanoId}
      initialLocale={locale}
      navigation={{
        backPath: '/guides/$nanoId/edit',
        backLabel: t('editor.backToGuide'),
        backParams: { nanoId: guideNanoId },
      }}
    >
      <StopEditPage guideNanoId={guideNanoId} />
    </StopEditorProvider>
  )
}
