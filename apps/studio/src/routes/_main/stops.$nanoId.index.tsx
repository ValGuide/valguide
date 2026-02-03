import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { pickBestLocale } from '@valguide/core/features/guides/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ArrowLeft, Edit, Globe } from 'lucide-react'
import { useMemo } from 'react'
import { stopDetailQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/$nanoId/')({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.nanoId))
    return { nanoId: params.nanoId, preferredLocale: context.locale }
  },
  component: StopPage,
})

function StopPage() {
  const { nanoId, preferredLocale } = Route.useLoaderData()
  const { data: stop } = useSuspenseQuery(stopDetailQueryOptions(nanoId))
  const router = useRouter()
  const t = useTranslations('stops')

  const { displayTitle, displayDescription } = useMemo(() => {
    const bestLocale = pickBestLocale(preferredLocale, stop.locales)
    return {
      displayTitle: bestLocale?.title?.trim() || t('unknownTitle'),
      displayDescription: bestLocale?.description ?? null,
    }
  }, [stop, preferredLocale, t])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: '/stops' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToStops')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{displayTitle}</h1>
              {displayDescription && <p className="text-muted-foreground">{displayDescription}</p>}
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/stops/$nanoId/edit" params={{ nanoId }}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('actions.edit')}
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('detail.translations')}
              </CardTitle>
              <CardDescription>{t('detail.translationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stop.locales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('detail.noTranslations')}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stop.locales.map((localeInfo) => (
                      <div key={localeInfo.locale} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium uppercase">{localeInfo.locale}</span>
                            {!localeInfo.hasPublished && (
                              <Badge variant="outline" className="text-xs">
                                {t('detail.draft')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-50">
                            {localeInfo.title || t('unknownTitle')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/stops/$nanoId/edit" params={{ nanoId }} search={{ locale: localeInfo.locale }}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
