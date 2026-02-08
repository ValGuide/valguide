import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export type ChangeSummaryBannerProps = {
  changedCount: number
  changedFields: string[]
  fieldLabels?: Record<string, string>
  className?: string
}

export function ChangeSummaryBanner({ changedCount, changedFields, fieldLabels, className }: ChangeSummaryBannerProps) {
  const t = useTranslations('tours.editor')
  const [expanded, setExpanded] = useState(false)

  if (changedCount <= 0) return null

  return (
    <div
      className={cn('rounded-md border border-amber-500/20 border-l-4 border-l-amber-500 bg-amber-500/5', className)}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3"
        aria-expanded={expanded}
        aria-label={expanded ? t('hideChanges') : t('showChanges')}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{t('pendingChanges', { count: changedCount })}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
        )}
      </button>

      {expanded && changedFields.length > 0 && (
        <ul className="border-amber-500/20 border-t px-4 pb-3 pt-2">
          {changedFields.map((field) => (
            <li key={field} className="flex items-center gap-2 py-0.5 text-sm text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {fieldLabels?.[field] ?? field}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
