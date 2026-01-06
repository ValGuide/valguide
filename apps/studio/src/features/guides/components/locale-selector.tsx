import { useTranslations } from '@valguide/core/i18n/mock'
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
import { useEffect, useState } from 'react'
import type { LocaleStatusMap, TranslationLocaleStatus } from '../utils/translation-status'

export type { LocaleStatusMap, TranslationLocaleStatus }

export type ContentLocale = string

export type LocaleSelectorProps = {
  value: ContentLocale
  locales: ContentLocale[]
  onValueChange: (locale: ContentLocale) => void
  localeStatus?: LocaleStatusMap
  className?: string
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German',
  rm: 'Romansh',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sl: 'Slovenian',
  uk: 'Ukrainian',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ar: 'Arabic',
  he: 'Hebrew',
  tr: 'Turkish',
  el: 'Greek',
  da: 'Danish',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
}

export function getLocaleDisplayName(locale: string): string {
  if (LOCALE_NAMES[locale]) return LOCALE_NAMES[locale]

  if (typeof window !== 'undefined' && 'DisplayNames' in Intl) {
    try {
      const dn = new Intl.DisplayNames(['en'], { type: 'language' })
      const name = dn.of(locale)
      if (name) return name
    } catch {
      // ignore
    }
  }

  return locale.toUpperCase()
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

export function LocaleSelector({ value, locales, onValueChange, localeStatus, className }: LocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const t = useTranslations('guides.localeSelector')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedLocaleName = getLocaleDisplayName(value)
  const selectedStatus = localeStatus?.[value]

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
                const localeName = getLocaleDisplayName(locale)
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
