'use client'

import type { SupportedLocale } from '@valguide/i18n/i18n.config'
import { supportedLocales } from '@valguide/i18n/i18n.config'
import { Button } from '@valguide/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@valguide/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { cn } from '@valguide/ui/lib/utils'
import { Check, ChevronDown, Circle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { LocaleStatusMap, TranslationLocaleStatus } from '../utils/translation-status'

export type { LocaleStatusMap, TranslationLocaleStatus }

export type LocaleSelectorProps = {
  value: SupportedLocale
  onValueChange: (locale: SupportedLocale) => void
  localeStatus?: LocaleStatusMap
  className?: string
}

const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'German',
  rm: 'Romansh',
}

function getStatusIcon(status: TranslationLocaleStatus) {
  switch (status) {
    case 'published':
      return <Circle className="h-2 w-2 fill-green-500 text-green-500" />
    case 'draft':
      return <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
    case 'empty':
      return <Circle className="h-2 w-2 fill-muted-foreground/30 text-muted-foreground/30" />
  }
}

function getStatusLabel(
  status: TranslationLocaleStatus,
  t: ReturnType<typeof useTranslations<'guides.localeSelector'>>,
) {
  switch (status) {
    case 'published':
      return t('statusPublished')
    case 'draft':
      return t('statusDraft')
    case 'empty':
      return t('statusEmpty')
  }
}

export function LocaleSelector({ value, onValueChange, localeStatus, className }: LocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const t = useTranslations('guides.localeSelector')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedLocaleName = LOCALE_NAMES[value] ?? value.toUpperCase()
  const selectedStatus = localeStatus?.[value]

  const locales = supportedLocales

  if (!isMounted) {
    return (
      <Button variant="outline" disabled className={cn('w-[200px] justify-between', className)}>
        <span className="flex items-center gap-2">
          {selectedStatus && getStatusIcon(selectedStatus)}
          {selectedLocaleName}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t('selectLanguage')}
          className={cn('w-[200px] justify-between', className)}
        >
          <span className="flex items-center gap-2">
            {selectedStatus && getStatusIcon(selectedStatus)}
            {selectedLocaleName}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('searchLanguages')} />
          <CommandList>
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {locales.map((locale) => {
                const localeName = LOCALE_NAMES[locale] ?? locale.toUpperCase()
                const status = localeStatus?.[locale]
                return (
                  <CommandItem
                    key={locale}
                    value={localeName}
                    onSelect={() => {
                      onValueChange(locale)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {status && getStatusIcon(status)}
                      {localeName}
                    </span>
                    <span className="flex items-center gap-2">
                      {status && <span className="text-xs text-muted-foreground">{getStatusLabel(status, t)}</span>}
                      {value === locale && <Check className="h-4 w-4" />}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function getLocaleDisplayName(locale: SupportedLocale): string {
  return LOCALE_NAMES[locale] ?? locale.toUpperCase()
}
