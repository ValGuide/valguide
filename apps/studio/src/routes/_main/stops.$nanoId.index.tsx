import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ArrowLeft, Edit, Globe, Link as LinkIcon } from 'lucide-react'
import { stopDetailQueryOptions } from '@/features/stops/query-options'

export const Route = createFileRoute('/_main/stops/$nanoId/')({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(stopDetailQueryOptions(params.nanoId, context.locale))
    return { nanoId: params.nanoId, preferredLocale: context.locale }
  },
  component: StopPage,
})

function StopPage() {
  const { nanoId, preferredLocale } = Route.useLoaderData()
  const { data: stop } = useQuery(stopDetailQueryOptions(nanoId, preferredLocale))
  const router = useRouter()
  const t = useTranslations('stops')

  if (!stop) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Title and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{stop.displayTitle}</h1>
              {stop.displayDescription && <p className="text-muted-foreground">{stop.displayDescription}</p>}
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

          {/* Translations Card */}
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
                {stop.translationSummaries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('detail.noTranslations')}</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stop.translationSummaries.map((translation) => (
                      <div key={translation.locale} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium uppercase">{translation.locale}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{translation.title}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/stops/$nanoId/edit" params={{ nanoId }} search={{ locale: translation.locale }}>
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

          {/* Guide Associations Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                {t('detail.guides')}
              </CardTitle>
              <CardDescription>{t('detail.guidesDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {stop.guideAssociations.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('detail.noGuides')}</p>
              ) : (
                <div className="space-y-3">
                  {stop.guideAssociations.map((guide) => (
                    <div key={guide.guideId} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{guide.displayTitle}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {t('detail.position', { position: guide.position + 1 })}
                          </Badge>
                          {!guide.visible && (
                            <Badge variant="secondary" className="text-xs">
                              {t('detail.hidden')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/guides/$nanoId" params={{ nanoId: guide.guideNanoId }}>
                          {t('detail.viewGuide')}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
