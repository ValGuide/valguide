'use client'

import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { Progress } from '@valguide/ui/components/progress'
import { CheckCircle2, Circle } from 'lucide-react'

interface GuideProgressProps {
  guide: GuideWithStops
  locale: SupportedLocale
}

interface ProgressItem {
  label: string
  completed: boolean
}

export function GuideProgress({ guide, locale }: GuideProgressProps) {
  const translation = guide.translations.find((t) => t.locale === locale)

  const items: ProgressItem[] = [
    {
      label: 'Title added',
      completed: !!(translation?.currentVersion?.title ?? translation?.draftVersion?.title),
    },
    {
      label: 'Description added',
      completed: !!(translation?.currentVersion?.description ?? translation?.draftVersion?.description),
    },
    {
      label: 'Cover image added',
      completed: !!guide.coverImage,
    },
    {
      label: 'At least 1 stop created',
      completed: guide.stops.length > 0,
    },
    {
      label: 'All stops have titles',
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
        <h3 className="text-sm font-medium">Guide Completion</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
