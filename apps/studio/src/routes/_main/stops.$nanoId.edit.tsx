import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Loader2 } from 'lucide-react'
import { StopEditPage } from '@/features/stops/components/stop-edit-page'
import { StopEditorProvider } from '@/features/stops/contexts/stop-editor-context'
import { stopDetailQueryOptions, stopLocaleDraftQueryOptions } from '@/features/stops/query-options'

type SearchParams = {
  locale?: string
}

export const Route = createFileRoute('/_main/stops/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const stopDetail = await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.nanoId))

    if (!stopDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = stopDetail

    if (!requestedLocale || !availableLocales.includes(requestedLocale)) {
      const defaultLocale = availableLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/stops/$nanoId/edit',
        params: { nanoId: params.nanoId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    await context.queryClient.ensureQueryData(stopLocaleDraftQueryOptions(params.nanoId, requestedLocale))

    return { nanoId: params.nanoId, locale: requestedLocale }
  },
  notFoundComponent: StopNotFound,
  component: StopEditPageRoute,
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

function StopEditPageRoute() {
  const { nanoId, locale } = Route.useLoaderData()
  const t = useTranslations('stops')

  return (
    <StopEditorProvider
      nanoId={nanoId}
      initialLocale={locale}
      navigation={{
        backPath: '/stops',
        backLabel: t('backToStops'),
      }}
    >
      <StopEditPage />
    </StopEditorProvider>
  )
}
