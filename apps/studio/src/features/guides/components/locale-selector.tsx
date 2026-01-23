import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@valguide/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { cn } from '@valguide/ui/lib/utils'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

export type ContentLocale = string

export type LocaleSelectorProps = {
  value: ContentLocale
  locales: ContentLocale[]
  onValueChange: (locale: ContentLocale) => void
  guideNanoId?: string
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

const SEARCH_THRESHOLD = 8

export function LocaleSelector({ value, locales, onValueChange, guideNanoId, className }: LocaleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const t = useTranslations('guides.localeSelector')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const selectedLocaleName = getLocaleDisplayName(value)
  const showSearch = locales.length >= SEARCH_THRESHOLD

  if (!isMounted) {
    return (
      <Button variant="outline" disabled className={cn('w-[200px] justify-between', className)}>
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
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
            <Globe className="h-4 w-4" />
            {selectedLocaleName}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          {showSearch && <CommandInput placeholder={t('searchLanguages')} />}
          <CommandList>
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {locales.map((locale) => {
                const localeName = getLocaleDisplayName(locale)
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
                    <span>{localeName}</span>
                    {value === locale && <Check className="h-4 w-4" />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {guideNanoId && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem asChild>
                    <Link
                      to="/guides/$nanoId"
                      params={{ nanoId: guideNanoId }}
                      className="cursor-pointer text-muted-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {t('manageTranslations')}
                    </Link>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
