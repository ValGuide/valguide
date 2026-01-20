import { useLocale, useTranslations } from '@valguide/core/i18n/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@valguide/ui/components/card'
import type { StopWithGuides } from '../api/fetchers'

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

interface StopsListContentProps {
  stops: StopWithGuides[]
  onEditStop?: (stop: StopWithGuides) => void
}

export function StopsListContent({ stops, onEditStop }: StopsListContentProps) {
  const t = useTranslations('stops')
  const locale = useLocale()

  return (
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
  )
}
