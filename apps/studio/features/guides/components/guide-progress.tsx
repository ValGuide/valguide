'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Progress } from '@valguide/ui/components/progress'
import { CheckCircle2, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

  const items: ProgressItem[] = [
    {
      labelKey: 'titleAdded',
      completed: !!(translation?.currentVersion?.title ?? translation?.draftVersion?.title),
    },
    {
      labelKey: 'descriptionAdded',
      completed: !!(translation?.currentVersion?.description ?? translation?.draftVersion?.description),
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
          return !!(stopTranslation?.currentVersion?.title ?? stopTranslation?.draftVersion?.title)
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
    </div>
  )
}
