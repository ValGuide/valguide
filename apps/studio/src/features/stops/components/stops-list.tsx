import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@valguide/ui/components/empty'
import { PageTitle } from '@valguide/ui/components/page-title'
import { Skeleton } from '@valguide/ui/components/skeleton'
import { AlertCircle, MapPin } from 'lucide-react'
import type { StopWithGuides } from '../api/fetchers'

interface StopsListProps {
  stops?: StopWithGuides[]
  isLoading?: boolean
  error?: Error | null
  onEditStop?: (stop: StopWithGuides) => void
  onRetry?: () => void
}

function getLocalizedTitle(stop: StopWithGuides, locale: string, fallbackLocale = 'en'): string {
  const translation = stop.translations.find((t) => t.locale === locale)
  if (translation?.currentVersion?.title) {
    return translation.currentVersion.title
  }

  const fallbackTranslation = stop.translations.find((t) => t.locale === fallbackLocale)
  if (fallbackTranslation?.currentVersion?.title) {
    return fallbackTranslation.currentVersion.title
  }

  const draftTranslation = stop.translations.find((t) => t.locale === locale)
  if (draftTranslation?.draftVersion?.title) {
    return draftTranslation.draftVersion.title
  }

  const firstTranslation = stop.translations[0]
  return firstTranslation?.currentVersion?.title ?? firstTranslation?.draftVersion?.title ?? ''
}

function getGuideNames(stop: StopWithGuides, locale: string): string[] {
  return stop.guideStops.map((gs) => {
    const translation = gs.guide.translations.find((t) => t.locale === locale)
    return translation?.currentVersion?.title ?? gs.guide.nanoId
  })
}

export function StopsList({ stops = [], isLoading = false, error = null, onEditStop, onRetry }: StopsListProps) {
  const t = useTranslations('stops')
  const tCommon = useTranslations('common')
  const locale = useLocale()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton elements
            <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col space-y-1.5 p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{t('list.error')}</EmptyTitle>
          <EmptyDescription>{error.message ?? tCommon('error')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry} variant="outline">
            {tCommon('tryAgain')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (stops.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Empty className="border bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MapPin className="h-10 w-10 text-amber-600" />
            </EmptyMedia>
            <EmptyTitle className="text-xl">{t('empty.title')}</EmptyTitle>
            <EmptyDescription className="text-base">{t('list.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="space-y-6">
            <p className="text-sm text-muted-foreground">{t('list.emptyHint')}</p>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <PageTitle as="h2">{t('title')}</PageTitle>
          <p className="text-sm text-muted-foreground">{t('list.description')}</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stops.map((stop) => {
          const title = getLocalizedTitle(stop, locale) || t('untitled')
          const guideNames = getGuideNames(stop, locale)

          return (
            <Card
              key={stop.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => onEditStop?.(stop)}
            >
              <CardHeader>
                <CardTitle className="line-clamp-2">{title}</CardTitle>
                {guideNames.length > 0 && (
                  <CardDescription className="line-clamp-1">
                    {t('list.usedIn', { count: guideNames.length })}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {guideNames.slice(0, 2).map((name, i) => (
                    <span
                      key={`${stop.id}-guide-${i}`}
                      className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                  {guideNames.length > 2 && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t('list.moreGuides', { count: guideNames.length - 2 })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
