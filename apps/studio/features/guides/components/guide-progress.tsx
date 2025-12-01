'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import { getVersionedField } from '@valguide/core/features/guides/utils'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Badge } from '@valguide/ui/components/badge'
import { Progress } from '@valguide/ui/components/progress'
import { AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

interface GuideProgressProps {
  guide: GuideWithStops
  locale: SupportedLocale
}

interface ProgressItem {
  labelKey: string
  completed: boolean
}

export function GuideProgress({ guide, locale }: GuideProgressProps) {
  const t = useTranslations('guides.progress')
  const translation = guide.translations.find((t) => t.locale === locale)

  const { stopsWithDrafts, guideHasDraft } = useMemo(() => {
    const stopsWithDrafts = guide.stops.filter((stop) => {
      const stopTranslation = stop.translations.find((t) => t.locale === locale)
      return !!stopTranslation?.draftVersionId
    })
    const guideHasDraft = !!translation?.draftVersionId
    return { stopsWithDrafts, guideHasDraft }
  }, [guide.stops, locale, translation?.draftVersionId])

  const items: ProgressItem[] = [
    {
      labelKey: 'titleAdded',
      completed: !!getVersionedField(translation, 'title'),
    },
    {
      labelKey: 'descriptionAdded',
      completed: !!getVersionedField(translation, 'description'),
    },
    {
      labelKey: 'coverImageAdded',
      completed: !!guide.coverImage,
    },
    {
      labelKey: 'atLeastOneStop',
      completed: guide.stops.length > 0,
    },
    {
      labelKey: 'allStopsHaveTitles',
      completed:
        guide.stops.length > 0 &&
        guide.stops.every((stop) => {
          const stopTranslation = stop.translations.find((t) => t.locale === locale)
          return !!getVersionedField(stopTranslation, 'title')
        }),
    },
  ]

  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('title')}</h3>
        <span className="text-sm text-muted-foreground">
          {t('count', { completed: completedCount, total: totalCount })}
        </span>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.labelKey} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>{t(item.labelKey)}</span>
          </li>
        ))}
      </ul>

      {/* Unpublished Changes Section */}
      <div className="mt-6 space-y-3 border-t pt-4">
        <h3 className="text-sm font-medium">{t('unpublishedChanges')}</h3>
        {guideHasDraft || stopsWithDrafts.length > 0 ? (
          <ul className="space-y-2">
            {guideHasDraft && (
              <li className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">{t('guideDraft')}</span>
              </li>
            )}
            {stopsWithDrafts.length > 0 && (
              <li className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">{t('stopsWithDrafts', { count: stopsWithDrafts.length })}</span>
              </li>
            )}
          </ul>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">{t('allPublished')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
