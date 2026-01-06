'use client'

import type { StopWithTranslations } from '@valguide/core/features/guides/schema'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { Circle } from 'lucide-react'
import { useTranslations } from '@valguide/core/i18n/mock'
import { useMemo } from 'react'
import { getTranslationLocaleStatus, type TranslationLocaleStatus } from '../utils/translation-status'

interface TranslationStatusInlineProps {
  stop: StopWithTranslations
  maxVisible?: number
  locales?: string[]
}

function getStatusColor(status: TranslationLocaleStatus): string {
  switch (status) {
    case 'published':
      return 'fill-green-500 text-green-500'
    case 'draft':
      return 'fill-amber-500 text-amber-500'
    default:
      return 'fill-muted-foreground/30 text-muted-foreground/30'
  }
}

function getStatusLabel(
  status: TranslationLocaleStatus,
  t: ReturnType<typeof useTranslations<'stops.translationStatus'>>,
): string {
  switch (status) {
    case 'published':
      return t('published')
    case 'draft':
      return t('draft')
    default:
      return t('empty')
  }
}

export function TranslationStatusInline({
  stop,
  maxVisible = 3,
  locales = ['en', 'de', 'rm'],
}: TranslationStatusInlineProps) {
  const t = useTranslations('stops.translationStatus')

  const localeStatuses = useMemo(() => {
    return locales.map((locale) => {
      const translation = stop.translations.find((tr) => tr.locale === locale)
      return {
        locale,
        status: getTranslationLocaleStatus(translation),
      }
    })
  }, [locales, stop.translations])

  const visibleLocales = localeStatuses.slice(0, maxVisible)
  const hiddenCount = localeStatuses.length - maxVisible

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 text-xs">
        {visibleLocales.map(({ locale, status }) => (
          <Tooltip key={locale}>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-0.5 cursor-default">
                <span className="uppercase font-medium text-muted-foreground">{locale}</span>
                <Circle className={`h-2 w-2 ${getStatusColor(status)}`} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {locale.toUpperCase()}: {getStatusLabel(status, t)}
            </TooltipContent>
          </Tooltip>
        ))}
        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground cursor-default">+{hiddenCount}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <div className="space-y-1">
                {localeStatuses.slice(maxVisible).map(({ locale, status }) => (
                  <div key={locale} className="flex items-center gap-1.5">
                    <Circle className={`h-2 w-2 ${getStatusColor(status)}`} />
                    <span>
                      {locale.toUpperCase()}: {getStatusLabel(status, t)}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
