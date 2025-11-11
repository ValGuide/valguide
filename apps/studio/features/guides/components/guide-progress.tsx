'use client'

import { Progress } from '@valguide/ui/components/progress'
import { CheckCircle2, Circle } from 'lucide-react'
import type { GuideWithStops } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/i18n/i18n.config'

interface GuideProgressProps {
  guide: GuideWithStops
  locale: SupportedLocale
}

interface ProgressItem {
  label: string
  completed: boolean
}

export function GuideProgress({ guide, locale }: GuideProgressProps) {
  const translation = guide.translations.find(t => t.locale === locale)
  
  const items: ProgressItem[] = [
    {
      label: 'Title added',
      completed: !!translation?.title && translation.title.length > 0
    },
    {
      label: 'Description added',
      completed: !!translation?.description && translation.description.length > 0
    },
    {
      label: 'Cover image added',
      completed: !!guide.coverImage
    },
    {
      label: 'At least 1 stop created',
      completed: guide.stops.length > 0
    },
    {
      label: 'All stops have titles',
      completed: guide.stops.length > 0 && guide.stops.every(stop => {
        const stopTranslation = stop.translations.find(t => t.locale === locale)
        return !!stopTranslation?.title && stopTranslation.title.length > 0
      })
    }
  ]
  
  const completedCount = items.filter(item => item.completed).length
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
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {item.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
